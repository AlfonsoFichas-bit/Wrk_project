import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { notify } from "../lib/notify.js";
import { authenticateToken } from "../middleware/auth.js";
import {
	type ProjectIdResolver,
	requireProjectRole,
} from "../middleware/project-rbac.js";
import { requireSystemRole } from "../middleware/system-rbac.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("UserStoryErrorResponse");

const idParamSchema = z.object({ id: z.string() });

const userStoryCreateSchema = z
	.object({
		title: z.string().min(1).max(200),
		description: z.string().min(1).max(2000),
		acceptance: z.string().max(2000).optional(),
		projectId: z.string(),
		assigneeId: z.string().optional(),
		priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
		storyPoints: z.number().optional(),
	})
	.openapi("CreateUserStoryRequest");

const userStoryUpdateSchema = z
	.object({
		title: z.string().min(1).max(200).optional(),
		description: z.string().min(1).max(2000).optional(),
		acceptance: z.string().max(2000).optional(),
		assigneeId: z.string().optional(),
		priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
		storyPoints: z.number().optional(),
		status: z.string().optional(),
	})
	.openapi("UpdateUserStoryRequest");

// Resolver que obtiene el proyecto de una historia por su id.
const userStoryProjectResolver: ProjectIdResolver = async (c) => {
	const userStory = await prisma.userStory.findUnique({
		where: { id: c.req.param("id") },
	});
	return userStory?.projectId ?? null;
};

const storyManagers = ["PRODUCT_OWNER", "SCRUM_MASTER"];

const authenticated = [authenticateToken];
const storyWrite = [authenticateToken, requireProjectRole(storyManagers)];
const storyWriteById = [
	authenticateToken,
	requireProjectRole(storyManagers, userStoryProjectResolver),
];
const adminOnly = [authenticateToken, requireSystemRole("ADMIN")];

const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });

const listStoriesRoute = createRoute({
	method: "get",
	path: "/api/user-stories",
	tags: ["User Stories"],
	summary: "Listar historias de usuario (cualquier usuario autenticado)",
	middleware: authenticated,
	responses: {
		200: {
			description: "Listado de historias",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getStoryRoute = createRoute({
	method: "get",
	path: "/api/user-stories/{id}",
	tags: ["User Stories"],
	summary: "Obtener una historia por id (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Historia encontrada",
			content: { "application/json": { schema: dataSchema } },
		},
		404: {
			description: "Historia no encontrada",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const createStoryRoute = createRoute({
	method: "post",
	path: "/api/user-stories",
	tags: ["User Stories"],
	summary: "Crear historia de usuario (PRODUCT_OWNER, SCRUM_MASTER)",
	middleware: storyWrite,
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: userStoryCreateSchema } },
		},
	},
	responses: {
		201: {
			description: "Historia creada",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Datos inválidos",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const updateStoryRoute = createRoute({
	method: "put",
	path: "/api/user-stories/{id}",
	tags: ["User Stories"],
	summary: "Actualizar historia (PRODUCT_OWNER, SCRUM_MASTER)",
	middleware: storyWriteById,
	request: {
		params: idParamSchema,
		body: {
			required: true,
			content: { "application/json": { schema: userStoryUpdateSchema } },
		},
	},
	responses: {
		200: {
			description: "Historia actualizada",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Datos inválidos",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const deleteStoryRoute = createRoute({
	method: "delete",
	path: "/api/user-stories/{id}",
	tags: ["User Stories"],
	summary: "Eliminar historia (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Historia eliminada",
			content: {
				"application/json": { schema: z.object({ message: z.string() }) },
			},
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerUserStoryRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listStoriesRoute, async (c) => {
		try {
			const userStories = await prisma.userStory.findMany({
				include: {
					project: {
						select: { id: true, name: true },
					},
					assignee: {
						select: { id: true, name: true, email: true },
					},
				},
			});
			return c.json({ data: userStories }, 200);
		} catch {
			return c.json({ error: "Error al obtener user stories" }, 500);
		}
	});

	app.openapi(getStoryRoute, async (c) => {
		try {
			const userStory = await prisma.userStory.findUnique({
				where: { id: c.req.valid("param").id },
				include: {
					project: {
						select: { id: true, name: true },
					},
					assignee: {
						select: { id: true, name: true, email: true },
					},
					tasks: true,
				},
			});
			if (!userStory) {
				return c.json({ error: "User story no encontrado" }, 404);
			}
			return c.json({ data: userStory }, 200);
		} catch {
			return c.json({ error: "Error al obtener user story" }, 500);
		}
	});

	app.openapi(
		createStoryRoute,
		async (c) => {
			try {
				const {
					title,
					description,
					acceptance,
					projectId,
					assigneeId,
					priority,
					storyPoints,
				} = c.req.valid("json");

				const userStory = await prisma.userStory.create({
					data: {
						title,
						description,
						...(acceptance !== undefined && { acceptance }),
						projectId,
						...(assigneeId !== undefined && { assigneeId }),
						priority: priority || "MEDIUM",
						...(storyPoints !== undefined && { storyPoints }),
					},
				});
				return c.json({ data: userStory }, 201);
			} catch (error) {
				console.error(error);
				return c.json({ error: "Error al crear user story" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos inválidos" }, 400);
			}
		},
	);

	app.openapi(
		updateStoryRoute,
		async (c) => {
			try {
				const {
					title,
					description,
					acceptance,
					assigneeId,
					priority,
					storyPoints,
					status,
				} = c.req.valid("json");
				const userStoryId = c.req.valid("param").id;

				const dataToUpdate: Record<string, unknown> = {
					...(title !== undefined && { title }),
					...(description !== undefined && { description }),
					...(acceptance !== undefined && { acceptance }),
					...(assigneeId !== undefined && { assigneeId }),
					...(priority !== undefined && { priority }),
					...(storyPoints !== undefined && { storyPoints }),
				};

				if (status) {
					dataToUpdate.status = status;
					if (status === "COMPLETED" || status === "DONE") {
						dataToUpdate.completedAt = new Date();
					} else if (status === "BACKLOG" || status === "TODO") {
						dataToUpdate.completedAt = null;
					}
				}

				const previousStory = await prisma.userStory.findUnique({
					where: { id: userStoryId },
					select: { assigneeId: true },
				});

				const userStory = await prisma.userStory.update({
					where: { id: userStoryId },
					data: dataToUpdate,
					include: { project: { select: { name: true } } },
				});

				if (
					dataToUpdate.assigneeId &&
					dataToUpdate.assigneeId !== previousStory?.assigneeId
				) {
					await notify({
						userId: dataToUpdate.assigneeId as string,
						type: "USER_STORY_ASSIGNED",
						title: "Historia de Usuario Asignada",
						message: `Se te ha asignado la historia "${userStory.title}" en el proyecto ${userStory.project.name}`,
						entityType: "USER_STORY",
						entityId: userStory.id,
					});
				}

				return c.json({ data: userStory }, 200);
			} catch {
				return c.json({ error: "Error al actualizar user story" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos inválidos" }, 400);
			}
		},
	);

	app.openapi(deleteStoryRoute, async (c) => {
		try {
			await prisma.userStory.delete({
				where: { id: c.req.valid("param").id },
			});
			return c.json({ message: "User story eliminado" }, 200);
		} catch {
			return c.json({ error: "Error al eliminar user story" }, 500);
		}
	});
};
