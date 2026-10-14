import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { strongPasswordSchema } from "../lib/password.js";
import { authenticateToken } from "../middleware/auth.js";
import {
	requireSelfOrAdmin,
	requireSystemRole,
} from "../middleware/system-rbac.js";
import type { AppEnv } from "../types.js";

const BCRYPT_ROUNDS = 10;
const ROLE_VALUES = [
	"ADMIN",
	"PRODUCT_OWNER",
	"SCRUM_MASTER",
	"TEAM_DEVELOPER",
] as const;

const errorSchema = z
	.object({ error: z.string() })
	.openapi("UserErrorResponse");

const messageSchema = z.object({ message: z.string() });

const userListItemSchema = z
	.object({
		id: z.string(),
		email: z.string(),
		name: z.string(),
		role: z.string(),
		active: z.boolean(),
		createdAt: z.date(),
	})
	.openapi("UserListItem");

const userCreatedSchema = z
	.object({
		id: z.string(),
		email: z.string(),
		name: z.string(),
		role: z.string(),
		active: z.boolean(),
	})
	.openapi("UserCreated");

const userDetailSchema = z
	.object({
		id: z.string(),
		email: z.string(),
		name: z.string(),
		role: z.string(),
		active: z.boolean(),
		createdAt: z.date(),
		dashboardModules: z.string().nullable(),
		projects: z.array(z.unknown()),
		tasks: z.array(z.unknown()),
	})
	.openapi("UserDetail");

const createUserBodySchema = z
	.object({
		email: z.string().email("El email no es válido"),
		name: z.string().min(1, "El nombre es requerido").max(100),
		password: strongPasswordSchema,
		role: z.enum(ROLE_VALUES).optional().default("TEAM_DEVELOPER"),
	})
	.openapi("CreateUserRequest");

const updateUserBodySchema = z
	.object({
		name: z.string().optional(),
		email: z.string().email("El email no es válido").optional(),
		role: z.enum(ROLE_VALUES).optional(),
		active: z.boolean().optional(),
	})
	.openapi("UpdateUserRequest");

const idParamSchema = z.object({ id: z.string() });

const adminOnly = [authenticateToken, requireSystemRole("ADMIN")];
const selfOrAdmin = [authenticateToken, requireSelfOrAdmin];

const listUsersRoute = createRoute({
	method: "get",
	path: "/api/users",
	tags: ["Users"],
	summary: "Listar usuarios (solo ADMIN)",
	middleware: adminOnly,
	responses: {
		200: {
			description: "Listado de usuarios",
			content: {
				"application/json": {
					schema: z.object({ data: z.array(userListItemSchema) }),
				},
			},
		},
		401: {
			description: "No autorizado",
			content: { "application/json": { schema: errorSchema } },
		},
		403: {
			description: "Prohibido",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getUserRoute = createRoute({
	method: "get",
	path: "/api/users/{id}",
	tags: ["Users"],
	summary: "Obtener un usuario por id (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Usuario encontrado",
			content: {
				"application/json": { schema: z.object({ data: userDetailSchema }) },
			},
		},
		404: {
			description: "Usuario no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const dashboardSummaryRoute = createRoute({
	method: "get",
	path: "/api/users/{id}/dashboard-summary",
	tags: ["Users"],
	summary: "Resumen del panel del usuario (propio o ADMIN)",
	middleware: selfOrAdmin,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Resumen del panel",
			content: {
				"application/json": {
					schema: z.object({
						activeTasks: z.number(),
						totalItems: z.number(),
						dashboardModules: z.unknown(),
					}),
				},
			},
		},
		404: {
			description: "Usuario no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const dashboardUpdateRoute = createRoute({
	method: "put",
	path: "/api/users/{id}/dashboard",
	tags: ["Users"],
	summary: "Actualizar los módulos del panel (propio o ADMIN)",
	middleware: selfOrAdmin,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Panel actualizado",
			content: { "application/json": { schema: messageSchema } },
		},
		400: {
			description: "modules debe ser un array",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const createUserRoute = createRoute({
	method: "post",
	path: "/api/users",
	tags: ["Users"],
	summary: "Crear usuario (solo ADMIN)",
	middleware: adminOnly,
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: createUserBodySchema } },
		},
	},
	responses: {
		201: {
			description: "Usuario creado",
			content: {
				"application/json": { schema: z.object({ data: userCreatedSchema }) },
			},
		},
		400: {
			description: "Datos inválidos o email existente",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const updateUserRoute = createRoute({
	method: "put",
	path: "/api/users/{id}",
	tags: ["Users"],
	summary: "Actualizar usuario (solo ADMIN)",
	middleware: adminOnly,
	request: {
		params: idParamSchema,
		body: {
			required: true,
			content: { "application/json": { schema: updateUserBodySchema } },
		},
	},
	responses: {
		200: {
			description: "Usuario actualizado",
			content: {
				"application/json": { schema: z.object({ data: userCreatedSchema }) },
			},
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const deleteUserRoute = createRoute({
	method: "delete",
	path: "/api/users/{id}",
	tags: ["Users"],
	summary: "Eliminar usuario (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Usuario eliminado",
			content: {
				"application/json": {
					schema: z.object({ data: messageSchema }),
				},
			},
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerUserRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listUsersRoute, async (c) => {
		try {
			const users = await prisma.user.findMany({
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					active: true,
					createdAt: true,
				},
			});
			return c.json({ data: users }, 200);
		} catch {
			return c.json({ error: "Error al obtener usuarios" }, 500);
		}
	});

	app.openapi(getUserRoute, async (c) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: c.req.valid("param").id },
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					active: true,
					createdAt: true,
					dashboardModules: true,
					projects: true,
					tasks: true,
				},
			});
			if (!user) {
				return c.json({ error: "Usuario no encontrado" }, 404);
			}
			return c.json({ data: user }, 200);
		} catch {
			return c.json({ error: "Error al obtener usuario" }, 500);
		}
	});

	app.openapi(dashboardSummaryRoute, async (c) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: c.req.valid("param").id },
				include: {
					tasks: true,
					projects: true,
					projectMemberships: {
						include: {
							project: {
								include: { tasks: true },
							},
						},
					},
				},
			});

			if (!user) {
				return c.json({ error: "No encontrado" }, 404);
			}

			let activeTasks = 0;
			let totalItems = 0;

			if (user.role === "TEAM_DEVELOPER") {
				activeTasks = user.tasks.filter((t) => t.status !== "COMPLETED").length;
				totalItems = user.tasks.length;
			} else if (
				user.role === "PRODUCT_OWNER" ||
				user.role === "SCRUM_MASTER"
			) {
				// totalItems = total projects they are member of or own
				const projects = user.projectMemberships.map((m) => m.project);
				totalItems = projects.length;
				// activeTasks = total pending tasks in those projects
				activeTasks = projects.reduce(
					(acc, p) =>
						acc + p.tasks.filter((t) => t.status !== "COMPLETED").length,
					0,
				);
			}

			return c.json(
				{
					activeTasks,
					totalItems,
					dashboardModules: user.dashboardModules
						? JSON.parse(user.dashboardModules)
						: null,
				},
				200,
			);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error" }, 500);
		}
	});

	app.openapi(dashboardUpdateRoute, async (c) => {
		try {
			let body: unknown = {};
			try {
				body = await c.req.json();
			} catch {
				body = {};
			}

			const modules = (body as { modules?: unknown }).modules;
			if (!Array.isArray(modules)) {
				return c.json({ error: "modules debe ser un array" }, 400);
			}

			await prisma.user.update({
				where: { id: c.req.valid("param").id },
				data: { dashboardModules: JSON.stringify(modules) },
			});
			return c.json({ message: "Dashboard actualizado" }, 200);
		} catch {
			return c.json({ error: "Error al actualizar dashboard" }, 500);
		}
	});

	app.openapi(createUserRoute, async (c) => {
		try {
			const { email, name, password, role } = c.req.valid("json");

			const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

			const user = await prisma.user.create({
				data: {
					email,
					name,
					password: hashedPassword,
					role,
				},
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					active: true,
				},
			});
			return c.json({ data: user }, 201);
		} catch (error) {
			const err = error as { code?: string };
			if (err.code === "P2002") {
				return c.json({ error: "Email ya existe" }, 400);
			}
			return c.json({ error: "Error al crear usuario" }, 500);
		}
	});

	app.openapi(updateUserRoute, async (c) => {
		try {
			const { name, email, role, active } = c.req.valid("json");

			const user = await prisma.user.update({
				where: { id: c.req.valid("param").id },
				data: {
					...(name !== undefined && { name }),
					...(email !== undefined && { email }),
					...(role !== undefined && { role }),
					...(active !== undefined && { active }),
					// Si se desactiva al usuario, invalidar todos sus tokens
					...(active === false && { tokenVersion: { increment: 1 } }),
				},
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					active: true,
				},
			});
			return c.json({ data: user }, 200);
		} catch {
			return c.json({ error: "Error al actualizar usuario" }, 500);
		}
	});

	app.openapi(deleteUserRoute, async (c) => {
		try {
			await prisma.user.delete({
				where: { id: c.req.valid("param").id },
			});
			return c.json({ data: { message: "Usuario eliminado" } }, 200);
		} catch {
			return c.json({ error: "Error al eliminar usuario" }, 500);
		}
	});
};
