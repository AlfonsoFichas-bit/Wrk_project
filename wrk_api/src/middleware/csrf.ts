import type { MiddlewareHandler } from "hono";
import { corsOrigins } from "../env.js";
import type { AppEnv } from "../types.js";

const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Defensa en profundidad sobre SameSite=Lax: rechaza mutaciones cuyo
 * Origin/Referer esté presente pero no pertenezca a CORS_ORIGINS. Las
 * peticiones sin ninguno de los dos headers (CLI, tests) pasan.
 */
export const csrfProtection: MiddlewareHandler<AppEnv> = async (c, next) => {
	if (!CSRF_METHODS.has(c.req.method)) {
		return next();
	}

	const rawOrigin = c.req.header("origin") || c.req.header("referer");
	if (!rawOrigin) {
		return next();
	}

	let origin: string;
	try {
		origin = new URL(rawOrigin).origin;
	} catch {
		return c.body("Forbidden", 403);
	}

	if (!corsOrigins.includes(origin)) {
		return c.json({ error: "Origen no permitido" }, 403);
	}

	return next();
};
