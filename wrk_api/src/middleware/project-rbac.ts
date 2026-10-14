import type { MiddlewareHandler } from "hono";
import { prisma } from "../db.js";
import type { AppEnv } from "../types.js";

type Context = Parameters<MiddlewareHandler<AppEnv>>[0];

/**
 * Resuelve el `projectId` de la petición. Por defecto replica a Express:
 * `params.projectId || params.id || body.projectId`.
 */
export type ProjectIdResolver = (
	c: Context,
) => string | null | Promise<string | null>;

const defaultResolver: ProjectIdResolver = async (c) => {
	const fromParams = c.req.param("projectId") || c.req.param("id");
	if (fromParams) {
		return fromParams;
	}

	try {
		const body = (await c.req.json()) as { projectId?: unknown } | null;
		if (
			body &&
			typeof body === "object" &&
			typeof body.projectId === "string"
		) {
			return body.projectId;
		}
	} catch {
		// Sin body JSON: equivale a un body vacío.
	}

	return null;
};

/**
 * Restringe una ruta a los miembros de un proyecto con los roles indicados.
 * Los ADMIN acceden a cualquier proyecto. Equivalente a `requireProjectRole`
 * de la API original.
 */
export const requireProjectRole = (
	roles: string[],
	resolver: ProjectIdResolver = defaultResolver,
): MiddlewareHandler<AppEnv> => {
	return async (c, next) => {
		const user = c.get("user");

		if (!user) {
			return c.body("Unauthorized", 401);
		}

		// Bypass ADMIN: los docentes pueden acceder a cualquier proyecto
		if (user.role === "ADMIN") {
			await next();
			return;
		}

		const projectId = await resolver(c);
		if (!projectId) {
			return c.json({ error: "projectId required" }, 400);
		}

		const membership = await prisma.projectMember.findUnique({
			where: {
				projectId_userId: {
					projectId,
					userId: user.userId,
				},
			},
		});

		if (!membership || !roles.includes(membership.role)) {
			return c.body("Forbidden", 403);
		}

		c.set("projectMembership", membership);
		await next();
	};
};
