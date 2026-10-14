import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import type { NotificationType } from "@prisma/client";
import { prisma } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("NotificationPreferenceErrorResponse");

const typeParamSchema = z.object({ type: z.string() });

const authenticated = [authenticateToken];

const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });

const VALID_TYPES = [
	"TASK_ASSIGNED",
	"USER_STORY_ASSIGNED",
	"EVALUATION_COMPLETED",
	"MESSAGE",
	"PROJECT_ASSIGNED",
	"RETROSPECTIVE_ITEM",
	"SPRINT_COMPLETED",
];

const listPreferencesRoute = createRoute({
	method: "get",
	path: "/api/notification-preferences",
	tags: ["NotificationPreferences"],
	summary: "Preferencias de notificación del usuario",
	middleware: authenticated,
	responses: {
		200: {
			description: "Preferencias del usuario",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const updatePreferenceRoute = createRoute({
	method: "put",
	path: "/api/notification-preferences/{type}",
	tags: ["NotificationPreferences"],
	summary: "Activar/desactivar un tipo de notificación",
	middleware: authenticated,
	request: { params: typeParamSchema },
	responses: {
		200: {
			description: "Preferencia actualizada",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Tipo o valor inválido",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerNotificationPreferenceRoutes = (
	app: OpenAPIHono<AppEnv>,
): void => {
	app.openapi(listPreferencesRoute, async (c) => {
		try {
			const user = c.get("user");
			const preferences = await prisma.notificationPreference.findMany({
				where: { userId: user?.userId },
			});
			return c.json({ data: preferences }, 200);
		} catch (error) {
			console.error("Error fetching preferences:", error);
			return c.json({ error: "Error fetching preferences" }, 500);
		}
	});

	app.openapi(updatePreferenceRoute, async (c) => {
		try {
			const { type } = c.req.valid("param");
			const body = (await c.req.json().catch(() => ({}))) as {
				enabled?: unknown;
			};
			const { enabled } = body;

			if (!VALID_TYPES.includes(type)) {
				return c.json({ error: "Invalid notification type" }, 400);
			}

			if (typeof enabled !== "boolean") {
				return c.json({ error: "enabled must be a boolean" }, 400);
			}

			const user = c.get("user");
			const preference = await prisma.notificationPreference.upsert({
				where: {
					userId_type: {
						userId: user?.userId ?? "",
						type: type as NotificationType,
					},
				},
				update: {
					enabled,
				},
				create: {
					userId: user?.userId ?? "",
					type: type as NotificationType,
					enabled,
				},
			});

			return c.json({ data: preference }, 200);
		} catch (error) {
			console.error("Error updating preference:", error);
			return c.json({ error: "Error updating preference" }, 500);
		}
	});
};
