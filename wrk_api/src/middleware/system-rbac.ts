import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../types.js";

/**
 * Restringe una ruta a los roles de sistema indicados. Sin usuario en el
 * contexto responde 401; con un rol no autorizado responde 403.
 */
export const requireSystemRole = (
	...roles: string[]
): MiddlewareHandler<AppEnv> => {
	return async (c, next) => {
		const user = c.get("user");

		if (!user) {
			return c.body("Unauthorized", 401);
		}

		if (!roles.includes(user.role)) {
			return c.body("Forbidden", 403);
		}

		await next();
	};
};

/**
 * Permite la ruta al propio usuario (por `:id`) o a un ADMIN.
 */
export const requireSelfOrAdmin: MiddlewareHandler<AppEnv> = async (
	c,
	next,
) => {
	const user = c.get("user");

	if (!user) {
		return c.body("Unauthorized", 401);
	}

	if (user.userId !== c.req.param("id") && user.role !== "ADMIN") {
		return c.body("Forbidden", 403);
	}

	await next();
};
