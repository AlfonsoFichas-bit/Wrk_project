import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { isProd } from "../env.js";
import type { AppEnv } from "../types.js";
import { AUTH_COOKIE_NAME, TOKEN_MAX_AGE_MS } from "./jwt.js";

export const setAuthCookie = (c: Context<AppEnv>, token: string): void => {
	setCookie(c, AUTH_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "Lax",
		secure: isProd,
		maxAge: TOKEN_MAX_AGE_MS / 1000,
		path: "/",
	});
};

export const clearAuthCookie = (c: Context<AppEnv>): void => {
	deleteCookie(c, AUTH_COOKIE_NAME, {
		httpOnly: true,
		sameSite: "Lax",
		secure: isProd,
		path: "/",
	});
};
