import type { MiddlewareHandler } from "hono";
import { disableRateLimit } from "../env.js";
import type { AppEnv } from "../types.js";

interface RateLimiterOptions {
	windowMs: number;
	max: number;
	message: { error: string };
}

interface Bucket {
	count: number;
	resetAt: number;
}

const MAX_TRACKED_CLIENTS = 10_000;

const getClientIp = (c: Parameters<MiddlewareHandler<AppEnv>>[0]): string => {
	const forwardedFor = c.req.header("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() || "unknown";
	}
	return c.req.header("x-real-ip") ?? "unknown";
};

/**
 * Limitador de ventana fija en memoria, suficiente para un único proceso.
 * Se desactiva con DISABLE_RATE_LIMIT=true o NODE_ENV=test, igual que la API
 * original (la suite E2E crea muchas sesiones).
 */
export const createRateLimiter = ({
	windowMs,
	max,
	message,
}: RateLimiterOptions): MiddlewareHandler<AppEnv> => {
	const buckets = new Map<string, Bucket>();

	return async (c, next) => {
		if (disableRateLimit) {
			return next();
		}

		const now = Date.now();
		const key = getClientIp(c);

		if (buckets.size > MAX_TRACKED_CLIENTS) {
			for (const [bucketKey, bucket] of buckets) {
				if (bucket.resetAt <= now) {
					buckets.delete(bucketKey);
				}
			}
		}

		let bucket = buckets.get(key);
		if (!bucket || bucket.resetAt <= now) {
			bucket = { count: 0, resetAt: now + windowMs };
			buckets.set(key, bucket);
		}

		bucket.count += 1;

		if (bucket.count > max) {
			const retryAfterSeconds = Math.max(
				1,
				Math.ceil((bucket.resetAt - now) / 1000),
			);
			return c.json(message, 429, {
				"Retry-After": String(retryAfterSeconds),
			});
		}

		return next();
	};
};

export const authLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: { error: "Demasiados intentos, intenta de nuevo más tarde" },
});

export const registerLimiter = createRateLimiter({
	windowMs: 60 * 60 * 1000,
	max: 10,
	message: {
		error: "Demasiados intentos de registro, intenta de nuevo más tarde",
	},
});

export const apiLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: { error: "Demasiadas solicitudes, intenta de nuevo más tarde" },
});
