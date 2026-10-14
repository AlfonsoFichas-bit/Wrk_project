import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { prisma } from "../db.js";
import {
	AUTH_COOKIE_NAME,
	type TokenPayload,
	verifyToken,
} from "../lib/jwt.js";
import type { AppEnv } from "../types.js";

const unauthorizedResponse = (
	c: Parameters<MiddlewareHandler<AppEnv>>[0],
): Response => c.body("Unauthorized", 401, { "WWW-Authenticate": "Bearer" });

export const getTokenFromRequest = (
	c: Parameters<MiddlewareHandler<AppEnv>>[0],
): string | null => {
	const fromCookie = getCookie(c, AUTH_COOKIE_NAME);
	if (fromCookie) {
		return fromCookie;
	}
	const authHeader = c.req.header("authorization");
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.slice("Bearer ".length);
	}
	return null;
};

export const authenticateToken: MiddlewareHandler<AppEnv> = async (c, next) => {
	const token = getTokenFromRequest(c);

	if (!token) {
		return unauthorizedResponse(c);
	}

	let payload: TokenPayload;
	try {
		payload = await verifyToken(token);
	} catch {
		return unauthorizedResponse(c);
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
			select: {
				id: true,
				email: true,
				role: true,
				active: true,
				tokenVersion: true,
			},
		});

		if (!user?.active || user.tokenVersion !== payload.v) {
			return unauthorizedResponse(c);
		}

		c.set("user", {
			userId: user.id,
			email: user.email,
			role: user.role,
			tokenVersion: user.tokenVersion,
		});
	} catch {
		return c.body("Internal Server Error", 500);
	}

	await next();
};
