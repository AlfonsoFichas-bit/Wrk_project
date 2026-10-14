import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { clearAuthCookie, setAuthCookie } from "../lib/cookies.js";
import { signToken } from "../lib/jwt.js";
import { strongPasswordSchema } from "../lib/password.js";
import { authenticateToken } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

// Hash dummy para igualar el tiempo de respuesta cuando el email no existe
const DUMMY_PASSWORD_HASH =
	"$2b$10$Aif6s5jywv/CTPHLyLCseud1Fv6JVY/FqB4geFmgTdMUzbTPv1ibG";
const DUMMY_REGISTRATION_TIMING = "dummy-registration-timing";
const BCRYPT_ROUNDS = 10;

const userProfileSchema = z
	.object({
		id: z.string(),
		email: z.string(),
		name: z.string(),
		role: z.string(),
	})
	.openapi("UserProfile");

const errorSchema = z.object({ error: z.string() }).openapi("ErrorResponse");

const messageSchema = z.object({ message: z.string() });

const registerBodySchema = z
	.object({
		name: z.string().min(1).max(100),
		email: z.string().email(),
		password: strongPasswordSchema,
	})
	.openapi("RegisterRequest");

const loginBodySchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(1),
	})
	.openapi("LoginRequest");

const registerRoute = createRoute({
	method: "post",
	path: "/api/auth/register",
	tags: ["Auth"],
	summary: "Registrar un nuevo usuario",
	description:
		"Ignora cualquier rol enviado por el cliente: siempre crea TEAM_DEVELOPER y no emite sesión.",
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: registerBodySchema } },
		},
	},
	responses: {
		201: {
			description: "Usuario registrado exitosamente",
			content: {
				"application/json": {
					schema: z.object({ message: z.string(), user: userProfileSchema }),
				},
			},
		},
		400: {
			description: "Datos inválidos o email ya registrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const loginRoute = createRoute({
	method: "post",
	path: "/api/auth/login",
	tags: ["Auth"],
	summary: "Iniciar sesión",
	description:
		"Entrega el JWT en una cookie httpOnly con SameSite=Lax; nunca en el body.",
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: loginBodySchema } },
		},
	},
	responses: {
		200: {
			description: "Inicio de sesión exitoso",
			content: {
				"application/json": {
					schema: z.object({ message: z.string(), user: userProfileSchema }),
				},
			},
		},
		400: {
			description: "Email y contraseña requeridos",
			content: { "application/json": { schema: errorSchema } },
		},
		401: {
			description: "Credenciales inválidas o usuario desactivado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const logoutRoute = createRoute({
	method: "post",
	path: "/api/auth/logout",
	tags: ["Auth"],
	summary: "Cerrar sesión",
	description:
		"Incrementa tokenVersion, revocando todos los tokens previos, y limpia la cookie.",
	middleware: [authenticateToken],
	responses: {
		200: {
			description: "Sesión cerrada",
			content: { "application/json": { schema: messageSchema } },
		},
		401: {
			description: "No autorizado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerAuthRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(registerRoute, async (c) => {
		const { name, email, password } = c.req.valid("json");

		try {
			// Verificar si el email ya existe
			const existingUser = await prisma.user.findUnique({ where: { email } });

			if (existingUser) {
				// Ejecutar hashing dummy para igualar el tiempo de la respuesta
				// y no revelar si el email ya está registrado.
				await bcrypt.hash(DUMMY_REGISTRATION_TIMING, BCRYPT_ROUNDS);
				return c.json({ error: "El email ya está registrado" }, 400);
			}

			const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

			// El registro público siempre crea usuarios con rol TEAM_DEVELOPER.
			// Los roles privilegiados solo se asignan por un ADMIN via /api/users.
			const user = await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					role: "TEAM_DEVELOPER",
					active: true,
				},
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
				},
			});

			return c.json({ message: "Usuario registrado exitosamente", user }, 201);
		} catch (error) {
			const err = error as { code?: string };
			if (err.code === "P2002") {
				return c.json({ error: "El email ya está registrado" }, 400);
			}
			return c.json({ error: "Error al registrar usuario" }, 500);
		}
	});

	app.openapi(
		loginRoute,
		async (c) => {
			const { email, password } = c.req.valid("json");

			try {
				// Buscar usuario por email
				const user = await prisma.user.findUnique({ where: { email } });

				// Comparar siempre contra un hash (dummy si el email no existe)
				// para evitar la enumeración de emails por timing.
				const passwordMatch = await bcrypt.compare(
					password,
					user?.password ?? DUMMY_PASSWORD_HASH,
				);

				if (!user?.active || !passwordMatch) {
					return c.json({ error: "Email o contraseña incorrectos" }, 401);
				}

				const token = await signToken({
					userId: user.id,
					email: user.email,
					role: user.role,
					v: user.tokenVersion,
				});

				setAuthCookie(c, token);

				return c.json(
					{
						message: "Inicio de sesión exitoso",
						user: {
							id: user.id,
							email: user.email,
							name: user.name,
							role: user.role,
						},
					},
					200,
				);
			} catch {
				console.error("Error al procesar la solicitud de inicio de sesión");
				return c.json({ error: "Error al iniciar sesión" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Email y contraseña requeridos" }, 400);
			}
		},
	);

	app.openapi(logoutRoute, async (c) => {
		try {
			const user = c.get("user");

			if (!user) {
				return c.json({ error: "No autorizado" }, 401);
			}

			// Incrementar tokenVersion invalida todos los tokens previos del usuario
			await prisma.user.update({
				where: { id: user.userId },
				data: { tokenVersion: { increment: 1 } },
			});

			clearAuthCookie(c);

			return c.json({ message: "Sesión cerrada" }, 200);
		} catch {
			return c.json({ error: "Error al cerrar la sesión" }, 500);
		}
	});
};
