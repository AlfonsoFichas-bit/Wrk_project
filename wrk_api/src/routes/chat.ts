import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { notify } from "../lib/notify.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireProjectRole } from "../middleware/project-rbac.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("ChatErrorResponse");

const projectParamSchema = z.object({ projectId: z.string() });
const userParamSchema = z.object({ userId: z.string() });
const chatParamSchema = z.object({ chatId: z.string() });

const messageSchema = z
	.object({
		content: z.string().min(1).max(5000),
	})
	.openapi("SendMessageRequest");

const chatRoles = ["TEAM_DEVELOPER", "SCRUM_MASTER", "PRODUCT_OWNER"];

const authenticated = [authenticateToken];
const projectChat = [authenticateToken, requireProjectRole(chatRoles)];

const textSchema = z.string().openapi("ChatTextResponse");
const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });

const listProjectMessagesRoute = createRoute({
	method: "get",
	path: "/api/chat/{projectId}/messages",
	tags: ["Chat"],
	summary: "Mensajes del chat de un proyecto (miembros)",
	middleware: projectChat,
	request: { params: projectParamSchema },
	responses: {
		200: {
			description: "Mensajes del proyecto",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const sendProjectMessageRoute = createRoute({
	method: "post",
	path: "/api/chat/{projectId}/messages",
	tags: ["Chat"],
	summary: "Enviar mensaje al chat de un proyecto (miembros)",
	middleware: projectChat,
	request: {
		params: projectParamSchema,
		body: {
			required: true,
			content: { "application/json": { schema: messageSchema } },
		},
	},
	responses: {
		201: {
			description: "Mensaje creado",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Contenido requerido",
			content: { "application/json": { schema: errorSchema } },
		},
		401: {
			description: "No autenticado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const listUserChatsRoute = createRoute({
	method: "get",
	path: "/api/chat/user/{userId}/all",
	tags: ["Chat"],
	summary: "Chats directos de un usuario (propios o ADMIN)",
	middleware: authenticated,
	request: { params: userParamSchema },
	responses: {
		200: {
			description: "Chats directos",
			content: { "application/json": { schema: dataArraySchema } },
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

const createDirectChatRoute = createRoute({
	method: "post",
	path: "/api/chat/direct",
	tags: ["Chat"],
	summary: "Crear u obtener un chat directo",
	middleware: authenticated,
	responses: {
		200: {
			description: "Chat directo",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Faltan datos",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const listConversationMessagesRoute = createRoute({
	method: "get",
	path: "/api/chat/conversation/{chatId}/messages",
	tags: ["Chat"],
	summary: "Mensajes de una conversación por id",
	middleware: authenticated,
	request: { params: chatParamSchema },
	responses: {
		200: {
			description: "Mensajes de la conversación",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const sendConversationMessageRoute = createRoute({
	method: "post",
	path: "/api/chat/conversation/{chatId}/messages",
	tags: ["Chat"],
	summary: "Enviar mensaje a una conversación por id",
	middleware: authenticated,
	request: {
		params: chatParamSchema,
		body: {
			required: true,
			content: { "application/json": { schema: messageSchema } },
		},
	},
	responses: {
		201: {
			description: "Mensaje creado",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Contenido requerido",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerChatRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listProjectMessagesRoute, async (c) => {
		try {
			const { projectId } = c.req.valid("param");

			let chat = await prisma.chat.findFirst({
				where: { projectId },
				include: {
					messages: {
						include: { user: true },
						orderBy: { createdAt: "asc" },
					},
				},
			});

			if (!chat) {
				chat = await prisma.chat.create({
					data: { projectId },
					include: {
						messages: { include: { user: true } },
					},
				});
			}

			return c.json({ data: chat.messages || [] }, 200);
		} catch (error) {
			console.error("Error fetching messages:", error);
			return c.json({ error: "Error al obtener mensajes" }, 500);
		}
	});

	app.openapi(
		sendProjectMessageRoute,
		async (c) => {
			try {
				const { projectId } = c.req.valid("param");
				const { content } = c.req.valid("json");

				const userId = c.get("user")?.userId;
				if (!userId) {
					return c.json({ error: "No autenticado" }, 401);
				}

				let chat = await prisma.chat.findFirst({
					where: { projectId },
				});

				if (!chat) {
					chat = await prisma.chat.create({
						data: { projectId, type: "PROJECT" },
					});
				}

				const message = await prisma.message.create({
					data: {
						chatId: chat.id,
						userId,
						content,
					},
					include: { user: true },
				});

				return c.json({ data: message }, 201);
			} catch (error) {
				console.error("Error sending message:", error);
				return c.json({ error: "Error al enviar mensaje" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Contenido requerido" }, 400);
			}
		},
	);

	app.openapi(listUserChatsRoute, async (c) => {
		try {
			const { userId } = c.req.valid("param");
			const user = c.get("user");

			// Solo los propios o un ADMIN
			if (user?.userId !== userId && user?.role !== "ADMIN") {
				return c.text("Forbidden", 403);
			}

			const directChats = await prisma.chat.findMany({
				where: {
					type: "DIRECT",
					participants: { some: { userId } },
				},
				include: {
					participants: {
						include: {
							user: { select: { id: true, name: true, avatar: true } },
						},
					},
					messages: { orderBy: { createdAt: "desc" }, take: 1 },
				},
			});

			return c.json({ data: directChats }, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error loading chats" }, 500);
		}
	});

	app.openapi(createDirectChatRoute, async (c) => {
		try {
			const body = (await c.req.json().catch(() => ({}))) as {
				targetUserId?: string;
			};
			const { targetUserId } = body;
			const userId = c.get("user")?.userId;

			if (!userId || !targetUserId) {
				return c.json({ error: "Faltan datos" }, 400);
			}

			const myChats = await prisma.chat.findMany({
				where: {
					type: "DIRECT",
					participants: { some: { userId } },
				},
				include: { participants: true },
			});

			const existing = myChats.find((chat) =>
				chat.participants.some((p) => p.userId === targetUserId),
			);

			if (existing) {
				return c.json({ data: existing }, 200);
			}

			const chat = await prisma.chat.create({
				data: {
					type: "DIRECT",
					participants: {
						create: [{ userId }, { userId: targetUserId }],
					},
				},
			});
			return c.json({ data: chat }, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error creating DM" }, 500);
		}
	});

	app.openapi(listConversationMessagesRoute, async (c) => {
		try {
			const { chatId } = c.req.valid("param");
			const messages = await prisma.message.findMany({
				where: { chatId },
				include: { user: true },
				orderBy: { createdAt: "asc" },
			});
			return c.json({ data: messages }, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error fetching messages" }, 500);
		}
	});

	app.openapi(
		sendConversationMessageRoute,
		async (c) => {
			try {
				const { chatId } = c.req.valid("param");
				const { content } = c.req.valid("json");
				const userId = c.get("user")?.userId;
				if (!userId) {
					return c.json({ error: "Contenido requerido" }, 400);
				}

				const message = await prisma.message.create({
					data: {
						chatId,
						userId,
						content,
					},
					include: { user: true },
				});

				const chat = await prisma.chat.findUnique({
					where: { id: chatId },
					include: { participants: true },
				});

				if (chat && chat.type === "DIRECT") {
					const recipients = chat.participants.filter(
						(p) => p.userId !== userId,
					);
					for (const recipient of recipients) {
						await notify({
							userId: recipient.userId,
							type: "MESSAGE",
							title: "Nuevo Mensaje Directo",
							message: `${message.user.name} te ha enviado un mensaje`,
							entityType: "MESSAGE",
							entityId: message.id,
						});
					}
				}

				return c.json({ data: message }, 201);
			} catch (error) {
				console.error(error);
				return c.json({ error: "Error sending message" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Contenido requerido" }, 400);
			}
		},
	);
};
