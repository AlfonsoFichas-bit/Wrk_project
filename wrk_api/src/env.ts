import "dotenv/config";

// Entorno derivado una sola vez al arrancar. El banner, la validación de
// secretos y cualquier otra decisión que dependa del entorno consultan esta
// bandera en lugar de leer NODE_ENV por separado.
export const isProd = process.env.NODE_ENV === "production";

// Un secreto ausente es fatal en todos los entornos: no hay valor por defecto.
const secret = process.env.JWT_SECRET;

if (!secret) {
	throw new Error(
		"JWT_SECRET environment variable is required. Server cannot start without it.",
	);
}

export const jwtSecret = secret;

export const corsOrigins = process.env.CORS_ORIGINS?.split(",") ?? [
	"http://localhost:3000",
];

export const port = Number(process.env.API_PORT ?? 5000);

export const disableRateLimit =
	process.env.DISABLE_RATE_LIMIT === "true" || process.env.NODE_ENV === "test";

// Valor de ejemplo que entrega .env.example y longitud mínima aceptable en
// producción. Ambos valores son los que nadie cambiaría al desplegar, así que
// son exactamente los que el arranque de producción debe rechazar.
const EXAMPLE_JWT_SECRET = "your-super-secret-key-change-in-production";
const MIN_JWT_SECRET_LENGTH = 32;
const LOCAL_ORIGIN_PATTERN = /localhost|127\.0\.0\.1|\[::1\]/;

export interface ConfigProblem {
	variable: string;
	problem: string;
}

export const findProductionConfigProblems = (): ConfigProblem[] => {
	const problems: ConfigProblem[] = [];
	const secretValue = process.env.JWT_SECRET ?? "";

	if (secretValue.length === 0) {
		problems.push({
			variable: "JWT_SECRET",
			problem: "no está definida",
		});
	} else if (secretValue === EXAMPLE_JWT_SECRET) {
		problems.push({
			variable: "JWT_SECRET",
			problem: `sigue siendo el valor de ejemplo de .env.example ("${EXAMPLE_JWT_SECRET}")`,
		});
	} else if (secretValue.length < MIN_JWT_SECRET_LENGTH) {
		problems.push({
			variable: "JWT_SECRET",
			problem: `mide ${secretValue.length} caracteres y exige al menos ${MIN_JWT_SECRET_LENGTH}`,
		});
	}

	for (const origin of corsOrigins) {
		if (LOCAL_ORIGIN_PATTERN.test(origin)) {
			problems.push({
				variable: "CORS_ORIGINS",
				problem: `incluye el origen local "${origin}", que no debe exponerse en producción`,
			});
		}
	}

	return problems;
};
