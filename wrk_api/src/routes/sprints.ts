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
	.openapi("SprintErrorResponse");

const idParamSchema = z.object({ id: z.string() });

const sprintSchema = z
	.object({
		name: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		projectId: z.string(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		status: z.string().optional(),
	})
	.openapi("CreateSprintRequest");

const sprintUpdateSchema = z
	.object({
		name: z.string().min(1).max(200).optional(),
		description: z.string().max(2000).optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		status: z.string().optional(),
	})
	.openapi("UpdateSprintRequest");

const addStorySchema = z
	.object({ userStoryId: z.string().optional() })
	.openapi("AddStoryToSprintRequest");

// Resolver que obtiene el proyecto de un sprint por su id (PUT y add-story).
const sprintProjectResolver: ProjectIdResolver = async (c) => {
	const sprint = await prisma.sprint.findUnique({
		where: { id: c.req.param("id") },
	});
	return sprint?.projectId ?? null;
};

const sprintManagers = ["SCRUM_MASTER", "PRODUCT_OWNER"];

const authenticated = [authenticateToken];
const sprintWrite = [authenticateToken, requireProjectRole(sprintManagers)];
const sprintWriteById = [
	authenticateToken,
	requireProjectRole(sprintManagers, sprintProjectResolver),
];
const adminOnly = [authenticateToken, requireSystemRole("ADMIN")];

const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });

const listSprintsRoute = createRoute({
	method: "get",
	path: "/api/sprints",
	tags: ["Sprints"],
	summary: "Listar sprints (cualquier usuario autenticado)",
	middleware: authenticated,
	responses: {
		200: {
			description: "Listado de sprints",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getSprintRoute = createRoute({
	method: "get",
	path: "/api/sprints/{id}",
	tags: ["Sprints"],
	summary: "Obtener un sprint por id (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Sprint encontrado",
			content: { "application/json": { schema: dataSchema } },
		},
		404: {
			description: "Sprint no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const createSprintRoute = createRoute({
	method: "post",
	path: "/api/sprints",
	tags: ["Sprints"],
	summary: "Crear sprint (SCRUM_MASTER, PRODUCT_OWNER)",
	middleware: sprintWrite,
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: sprintSchema } },
		},
	},
	responses: {
		201: {
			description: "Sprint creado",
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

const updateSprintRoute = createRoute({
	method: "put",
	path: "/api/sprints/{id}",
	tags: ["Sprints"],
	summary: "Actualizar sprint (SCRUM_MASTER, PRODUCT_OWNER)",
	middleware: sprintWriteById,
	request: {
		params: idParamSchema,
		body: {
			required: true,
			content: { "application/json": { schema: sprintUpdateSchema } },
		},
	},
	responses: {
		200: {
			description: "Sprint actualizado",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Datos inválidos",
			content: { "application/json": { schema: errorSchema } },
		},
		404: {
			description: "Sprint no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const addStoryRoute = createRoute({
	method: "post",
	path: "/api/sprints/{id}/add-story",
	tags: ["Sprints"],
	summary:
		"Agregar historia de usuario a un sprint (SCRUM_MASTER, PRODUCT_OWNER)",
	middleware: sprintWriteById,
	request: {
		params: idParamSchema,
		body: {
			required: true,
			content: { "application/json": { schema: addStorySchema } },
		},
	},
	responses: {
		201: {
			description: "Historia agregada",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Falta userStoryId",
			content: { "application/json": { schema: errorSchema } },
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

const deleteSprintRoute = createRoute({
	method: "delete",
	path: "/api/sprints/{id}",
	tags: ["Sprints"],
	summary: "Eliminar sprint (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Sprint eliminado",
			content: {
				"application/json": { schema: z.object({ data: z.unknown() }) },
			},
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerSprintRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listSprintsRoute, async (c) => {
		try {
			const sprints = await prisma.sprint.findMany({
				include: {
					project: true,
					tasks: true,
					userStories: true,
					evaluations: true,
				},
			});
			return c.json({ data: sprints }, 200);
		} catch (error) {
			console.error("Error al obtener sprints:", error);
			return c.json({ error: "Error al obtener sprints" }, 500);
		}
	});

	app.openapi(getSprintRoute, async (c) => {
		try {
			const sprint = await prisma.sprint.findUnique({
				where: { id: c.req.valid("param").id },
				include: {
					project: true,
					tasks: true,
					userStories: true,
					evaluations: true,
				},
			});
			if (!sprint) {
				return c.json({ error: "Sprint no encontrado" }, 404);
			}
			return c.json({ data: sprint }, 200);
		} catch (error) {
			console.error("Error al obtener sprint:", error);
			return c.json({ error: "Error al obtener sprint" }, 500);
		}
	});

	app.openapi(
		createSprintRoute,
		async (c) => {
			try {
				const { name, description, projectId, startDate, endDate, status } =
					c.req.valid("json");

				const sprint = await prisma.sprint.create({
					data: {
						name,
						description,
						projectId,
						...(startDate && { startDate: new Date(startDate) }),
						...(endDate && { endDate: new Date(endDate) }),
						status: status || "PLANNING",
						// biome-ignore lint/suspicious/noExplicitAny: Prisma create data type is complex with optional fields
					} as any,
				});
				return c.json({ data: sprint }, 201);
			} catch (error) {
				console.error("Error al crear sprint:", error);
				return c.json({ error: "Error al crear sprint" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos inválidos" }, 400);
			}
		},
	);

	app.openapi(
		updateSprintRoute,
		async (c) => {
			try {
				const { name, description, startDate, endDate, status } =
					c.req.valid("json");
				const sprintId = c.req.valid("param").id;

				const existingSprint = await prisma.sprint.findUnique({
					where: { id: sprintId },
					include: {
						project: {
							include: { members: true },
						},
					},
				});

				if (!existingSprint) {
					return c.json({ error: "Sprint no encontrado" }, 404);
				}

				const sprint = await prisma.sprint.update({
					where: { id: sprintId },
					data: {
						...(name !== undefined && { name }),
						...(description !== undefined && { description }),
						...(startDate !== undefined && { startDate: new Date(startDate) }),
						...(endDate !== undefined && { endDate: new Date(endDate) }),
						...(status !== undefined && { status }),
					},
				});

				if (status === "COMPLETED" && existingSprint.status !== "COMPLETED") {
					const notifications = existingSprint.project.members.map((member) =>
						notify({
							userId: member.userId,
							type: "SPRINT_COMPLETED",
							title: "Sprint Completado",
							message: `El sprint "${sprint.name}" ha sido completado.`,
							entityType: "SPRINT",
							entityId: sprint.id,
						}),
					);
					if (notifications.length > 0) {
						await Promise.all(notifications);
					}
				}

				return c.json({ data: sprint }, 200);
			} catch (error) {
				console.error("Error al actualizar sprint:", error);
				return c.json({ error: "Error al actualizar sprint" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos inválidos" }, 400);
			}
		},
	);

	app.openapi(addStoryRoute, async (c) => {
		try {
			const { userStoryId } = c.req.valid("json");
			const sprintId = c.req.valid("param").id;

			if (!userStoryId) {
				return c.json({ error: "Falta userStoryId" }, 400);
			}

			const userStory = await prisma.userStory.findUnique({
				where: { id: userStoryId },
			});

			if (!userStory) {
				return c.json({ error: "Historia no encontrada" }, 404);
			}

			if (userStory.sprintId === sprintId) {
				return c.json({ error: "La historia ya está en el sprint" }, 400);
			}

			const updatedStory = await prisma.userStory.update({
				where: { id: userStoryId },
				data: { sprintId },
			});

			return c.json({ data: updatedStory }, 201);
		} catch (error) {
			console.error("Error al agregar historia al sprint:", error);
			return c.json({ error: "Error al agregar historia al sprint" }, 500);
		}
	});

	app.openapi(deleteSprintRoute, async (c) => {
		try {
			await prisma.sprint.delete({
				where: { id: c.req.valid("param").id },
			});
			return c.json({ data: { message: "Sprint eliminado" } }, 200);
		} catch (error) {
			console.error("Error al eliminar sprint:", error);
			return c.json({ error: "Error al eliminar sprint" }, 500);
		}
	});
};
