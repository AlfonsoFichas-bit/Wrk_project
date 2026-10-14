import { serve } from "@hono/node-server";
import { mkdirSync, existsSync } from "node:fs";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import {
	corsOrigins,
	findProductionConfigProblems,
	isProd,
	port,
} from "./env.js";
import { csrfProtection } from "./middleware/csrf.js";
import {
	apiLimiter,
	authLimiter,
	registerLimiter,
} from "./middleware/rate-limit.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerChatRoutes } from "./routes/chat.js";
import { registerDocumentRoutes } from "./routes/documents.js";
import { registerEvaluationRoutes } from "./routes/evaluations.js";
import { registerFileRoutes } from "./routes/files.js";
import { registerMetricRoutes } from "./routes/metrics.js";
import { registerNotificationPreferenceRoutes } from "./routes/notification-preferences.js";
import { registerNotificationRoutes } from "./routes/notifications.js";
import { registerProjectRoutes } from "./routes/projects.js";
import { registerRetrospectiveRoutes } from "./routes/retrospectives.js";
import { registerRubricRoutes } from "./routes/rubrics.js";
import { registerSprintRoutes } from "./routes/sprints.js";
import { registerTaskRoutes } from "./routes/tasks.js";
import { registerUserStoryRoutes } from "./routes/user-stories.js";
import { registerUserRoutes } from "./routes/users.js";
import type { AppEnv } from "./types.js";

// Asegurar que existe el directorio de uploads en la raíz
if (!existsSync("uploads")) {
	mkdirSync("uploads");
}

export const createApp = (): OpenAPIHono<AppEnv> => {
	const app = new OpenAPIHono<AppEnv>({
		// Formato de error de validación idéntico al de la API original:
		// primer issue de Zod y, si no lo hubiera, el fallback de cada router.
		defaultHook: (result, c) => {
			if (!result.success) {
				const fallback =
					c.req.method === "POST" && c.req.path === "/api/users"
						? "Faltan campos requeridos"
						: "Datos inválidos";
				const message = result.error.issues[0]?.message ?? fallback;
				return c.json({ error: message }, 400);
			}
		},
	});

	// Security headers (equivalente a helmet())
	app.use("*", secureHeaders());

	// CORS con credenciales para que funcione la autenticación por cookie
	app.use("/api/*", cors({ origin: corsOrigins, credentials: true }));

	// Rate limiting (mismo orden que la API original: limitadores y luego CSRF,
	// de forma que una petición bloqueada por CSRF también consume su cuota).
	app.use("/api/auth/login", authLimiter);
	app.use("/api/auth/register", registerLimiter);
	app.use("/api/*", apiLimiter);

	// Protección CSRF antes de las rutas API
	app.use("/api/*", csrfProtection);

	// Rutas API
	registerAuthRoutes(app);
	registerUserRoutes(app);
	registerProjectRoutes(app);
	registerSprintRoutes(app);
	registerTaskRoutes(app);
	registerUserStoryRoutes(app);
	registerChatRoutes(app);
	registerFileRoutes(app);
	registerDocumentRoutes(app);
	registerEvaluationRoutes(app);
	registerRubricRoutes(app);
	registerMetricRoutes(app);
	registerNotificationRoutes(app);
	registerNotificationPreferenceRoutes(app);
	registerRetrospectiveRoutes(app);

	// Health check
	app.get("/api/health", (c) =>
		c.json({ status: "ok", timestamp: new Date().toISOString() }),
	);

	// Documentación OpenAPI
	app.doc("/doc", {
		openapi: "3.0.0",
		info: {
			version: "2.0.0",
			title: "WorkflowS API (Hono)",
			description:
				"Port a Hono de la API de WorkflowS. API completa: autenticación, usuarios, proyectos, sprints, tareas, historias de usuario, rúbricas, evaluaciones, métricas, chat, documentos, notificaciones, preferencias de notificación y retrospectivas.",
		},
	});

	// Error handling para rutas no encontradas
	app.notFound((c) => c.json({ error: "Ruta no encontrada" }, 404));

	return app;
};

export const app = createApp();

// En producción se falla rápido antes de aceptar tráfico: una configuración
// insegura es un fallo ruidoso, no un despliegue silencioso.
if (isProd) {
	const problems = findProductionConfigProblems();
	if (problems.length > 0) {
		for (const problem of problems) {
			console.error(
				`✖ Configuración de producción insegura — ${problem.variable}: ${problem.problem}`,
			);
		}
		console.error(
			"El servidor no arranca con una configuración insegura. Consulta .env.example.",
		);
		process.exit(1);
	}
}

const server = serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.info(
			`🚀 API Server corriendo en http://localhost:${info.port} — entorno: ${isProd ? "PRODUCCIÓN" : "DESARROLLO"} (VERSION 2 - SECURED)`,
		);
	},
);

// Node cierra las conexiones keep-alive a los 5s por defecto. Los clientes que
// reutilizan el socket (p. ej. el APIRequestContext de Playwright) llegan al
// siguiente request con una conexión ya cerrada y la escritura falla con
// ECONNRESET. Se alinean los timeouts con los del proxy (60s) para evitarlo.
if ("keepAliveTimeout" in server) {
	server.keepAliveTimeout = 65_000;
	server.headersTimeout = 66_000;
}

export default server;
