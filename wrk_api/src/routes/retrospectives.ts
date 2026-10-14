import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { notify } from "../lib/notify.js";
import { authenticateToken } from "../middleware/auth.js";
import {
	type ProjectIdResolver,
	requireProjectRole,
} from "../middleware/project-rbac.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("RetrospectiveErrorResponse");

const sprintParamSchema = z.object({ sprintId: z.string() });
const idParamSchema = z.object({ id: z.string() });

const retroItemSchema = z
	.object({
		sprintId: z.string(),
		type: z.string().min(1),
		content: z.string().min(1).max(2000),
		userId: z.string(),
	})
	.openapi("CreateRetrospectiveItemRequest");

// Resolver del GET /:sprintId: el proyecto del sprint indicado.
const sprintParamResolver: ProjectIdResolver = async (c) => {
	const sprint = await prisma.sprint.findUnique({
		where: { id: c.req.param("sprintId") },
	});
	return sprint?.projectId ?? null;
};

// Resolver del POST /: el sprint viene en el body.
const sprintBodyResolver: ProjectIdResolver = async (c) => {
	const body = (await c.req.json().catch(() => ({}))) as {
		sprintId?: unknown;
	};
	if (typeof body.sprintId !== "string") {
		return null;
	}
	const sprint = await prisma.sprint.findUnique({
		where: { id: body.sprintId },
	});
	return sprint?.projectId ?? null;
};

// Resolver del DELETE /:id: el proyecto del sprint del ítem.
const itemResolver: ProjectIdResolver = async (c) => {
	const item = await prisma.retrospectiveItem.findUnique({
		where: { id: c.req.param("id") },
		include: { sprint: true },
	});
	return item?.sprint?.projectId ?? null;
};

const retroRoles = ["TEAM_DEVELOPER", "SCRUM_MASTER", "PRODUCT_OWNER"];

const listItemsMiddleware = [
	authenticateToken,
	requireProjectRole(retroRoles, sprintParamResolver),
];
const createItemMiddleware = [
	authenticateToken,
	requireProjectRole(retroRoles, sprintBodyResolver),
];
const deleteItemMiddleware = [
	authenticateToken,
	requireProjectRole(retroRoles, itemResolver),
];

const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });

const listItemsRoute = createRoute({
	method: "get",
	path: "/api/retrospectives/{sprintId}",
	tags: ["Retrospectives"],
	summary: "Ítems de retrospectiva de un sprint (miembros del proyecto)",
	middleware: listItemsMiddleware,
	request: { params: sprintParamSchema },
	responses: {
		200: {
			description: "Ítems de la retrospectiva",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const createItemRoute = createRoute({
	method: "post",
	path: "/api/retrospectives",
	tags: ["Retrospectives"],
	summary: "Crear ítem de retrospectiva (miembros del proyecto)",
	middleware: createItemMiddleware,
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: retroItemSchema } },
		},
	},
	responses: {
		201: {
			description: "Ítem creado",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Datos incompletos",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const deleteItemRoute = createRoute({
	method: "delete",
	path: "/api/retrospectives/{id}",
	tags: ["Retrospectives"],
	summary: "Eliminar ítem de retrospectiva (miembros del proyecto)",
	middleware: deleteItemMiddleware,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Ítem eliminado",
			content: {
				"application/json": {
					schema: z
						.object({ message: z.string() })
						.openapi("RetrospectiveMessage"),
				},
			},
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerRetrospectiveRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listItemsRoute, async (c) => {
		try {
			const items = await prisma.retrospectiveItem.findMany({
				where: { sprintId: c.req.valid("param").sprintId },
				include: {
					user: {
						select: { id: true, name: true, avatar: true },
					},
				},
				orderBy: { createdAt: "asc" },
			});
			return c.json({ data: items }, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error al obtener retrospectiva" }, 500);
		}
	});

	app.openapi(
		createItemRoute,
		async (c) => {
			try {
				const { sprintId, type, content, userId } = c.req.valid("json");

				const item = await prisma.retrospectiveItem.create({
					data: {
						sprintId,
						type,
						content,
						userId,
					},
					include: {
						user: {
							select: { id: true, name: true, avatar: true },
						},
						sprint: {
							include: {
								project: {
									include: {
										members: true,
									},
								},
							},
						},
					},
				});

				const projectMembers = item.sprint.project.members;
				const notifications = projectMembers
					.filter((member) => member.userId !== userId)
					.map((member) =>
						notify({
							userId: member.userId,
							type: "RETROSPECTIVE_ITEM",
							title: "Nueva Nota en Retrospectiva",
							message: `Se ha añadido una nota "${type}" en el sprint ${item.sprint.name}`,
							entityType: "RETROSPECTIVE_ITEM",
							entityId: item.id,
						}),
					);

				if (notifications.length > 0) {
					await Promise.all(notifications);
				}

				return c.json({ data: item }, 201);
			} catch (error) {
				console.error(error);
				return c.json({ error: "Error al crear item" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos incompletos" }, 400);
			}
		},
	);

	app.openapi(deleteItemRoute, async (c) => {
		try {
			await prisma.retrospectiveItem.delete({
				where: { id: c.req.valid("param").id },
			});
			return c.json({ message: "Item eliminado" }, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error al eliminar item" }, 500);
		}
	});
};
