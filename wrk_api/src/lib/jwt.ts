import { randomUUID } from "node:crypto";
import { sign, verify } from "hono/jwt";
import { jwtSecret } from "../env.js";

export const JWT_ISSUER = "workflows-api";
export const JWT_AUDIENCE = "workflows-web";
export const AUTH_COOKIE_NAME = "token";
export const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface TokenPayload {
	userId: string;
	email: string;
	role: string;
	/** tokenVersion del usuario en el momento de emitir el token */
	v: number;
	iss?: string;
	aud?: string;
	jti?: string;
	iat?: number;
	exp?: number;
}

export interface TokenClaims {
	userId: string;
	email: string;
	role: string;
	v: number;
}

/**
 * Firma un JWT HS256 con `iss`/`aud`/`jti`/`iat`/`exp` explícitos, porque
 * `hono/jwt`'s `sign` no añade `exp` por su cuenta.
 */
export const signToken = (claims: TokenClaims): Promise<string> => {
	const now = Math.floor(Date.now() / 1000);

	return sign(
		{
			userId: claims.userId,
			email: claims.email,
			role: claims.role,
			v: claims.v,
			iss: JWT_ISSUER,
			aud: JWT_AUDIENCE,
			jti: randomUUID(),
			iat: now,
			exp: now + TOKEN_MAX_AGE_MS / 1000,
		},
		jwtSecret,
		"HS256",
	);
};

/** Verifica firma HS256, expiración, issuer y audience. Lanza si algo falla. */
export const verifyToken = async (token: string): Promise<TokenPayload> => {
	const payload = await verify(token, jwtSecret, {
		alg: "HS256",
		iss: JWT_ISSUER,
		aud: JWT_AUDIENCE,
		exp: true,
	});

	return payload as unknown as TokenPayload;
};
