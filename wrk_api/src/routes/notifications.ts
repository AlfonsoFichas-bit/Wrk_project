import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("NotificationErrorResponse");

const idParamSchema = z.object({ id: z.string() });
const listQuerySchema = z
	.object({ userId: z.string().optional() })
	.openapi("ListNotificationsQuery");

const authenticated = [authenticateToken];

const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });
const textSchema = z.string().openapi("NotificationTextResponse");
const messageSchema = z
	.object({ message: z.string() })
	.openapi("NotificationMessageResponse");

const listNotificationsRoute = createRoute({
	method: "get",
	path: "/api/notifications",
	tags: ["Notifications"],
	summary: "Notificaciones de un usuario (propias o ADMIN)",
	middleware: authenticated,
	request: { query: listQuerySchema },
	responses: {
		200: {
			description: "Listado de notificaciones",
			content: { "application/json": { schema: dataArraySchema } },
		},
		400: {
			description: "Falta userId",
			content: { "application/json": { schema: errorSchema } },
		},
		403: {
			description: "Prohibido",
			content: { "text/plain": { schema: textSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const unreadCountRoute = createRoute({
	method: "get",
	path: "/api/notifications/unread-count",
	tags: ["Notifications"],
	summary: "Número de notificaciones sin leer del usuario",
	middleware: authenticated,
	responses: {
		200: {
			description: "Conteo de no leídas",
			content: { "application/json": { schema: dataSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const readAllRoute = createRoute({
	method: "put",
	path: "/api/notifications/read-all",
	tags: ["Notifications"],
	summary: "Marcar todas las notificaciones como leídas",
	middleware: authenticated,
	responses: {
		200: {
			description: "Todas marcadas",
			content: { "application/json": { schema: messageSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const readOneRoute = createRoute({
	method: "put",
	path: "/api/notifications/{id}/read",
	tags: ["Notifications"],
	summary: "Marcar una notificación como leída (propia o ADMIN)",
	middleware: authenticated,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Marcada como leída",
			content: { "application/json": { schema: messageSchema } },
		},
		403: {
			description: "Prohibido",
			content: { "text/plain": { schema: textSchema } },
		},
		404: {
			description: "Notificación no encontrada",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerNotificationRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listNotificationsRoute, async (c) => {
		try {
			const { userId } = c.req.valid("query");
			if (!userId) {
				return c.json({ error: "Falta userId" }, 400);
			}

			const user = c.get("user");
			// Solo las propias o un ADMIN pueden verlas
			if (user?.userId !== String(userId) && user?.role !== "ADMIN") {
				return c.text("Forbidden", 403);
			}

			const notifications = await prisma.notification.findMany({
				where: { userId: String(userId) },
				orderBy: { createdAt: "desc" },
				take: 20,
			});
			return c.json({ data: notifications }, 200);
		} catch (_error) {
			return c.json({ error: "Error al obtener notificaciones" }, 500);
		}
	});

	app.openapi(unreadCountRoute, async (c) => {
		try {
			const user = c.get("user");
			const count = await prisma.notification.count({
				where: { userId: user?.userId, read: false },
			});
			return c.json({ data: count }, 200);
		} catch (_error) {
			return c.json({ error: "Error counting unread notifications" }, 500);
		}
	});

	app.openapi(readAllRoute, async (c) => {
		try {
			const user = c.get("user");
			await prisma.notification.updateMany({
				where: { userId: user?.userId, read: false },
				data: { read: true },
			});
			return c.json({ message: "Todas marcadas como leídas" }, 200);
		} catch (_error) {
			return c.json({ error: "Error updating notifications" }, 500);
		}
	});

	app.openapi(readOneRoute, async (c) => {
		try {
			const notificationId = c.req.valid("param").id;

			const notification = await prisma.notification.findUnique({
				where: { id: notificationId },
			});
			if (!notification) {
				return c.json({ error: "Notificación no encontrada" }, 404);
			}

			const user = c.get("user");
			if (user?.userId !== notification.userId && user?.role !== "ADMIN") {
				return c.text("Forbidden", 403);
			}

			await prisma.notification.update({
				where: { id: notificationId },
				data: { read: true },
			});
			return c.json({ message: "Marcada como leída" }, 200);
		} catch (_error) {
			return c.json({ error: "Error al actualizar notificación" }, 500);
		}
	});
};
