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
	.openapi("TaskErrorResponse");

const idParamSchema = z.object({ id: z.string() });

const taskCreateSchema = z
	.object({
		title: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		projectId: z.string(),
		assigneeId: z.string().optional(),
		priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
		deadline: z.string().optional(),
		status: z.string().optional(),
		sprintId: z.string().optional(),
		userStoryId: z.string().optional(),
	})
	.openapi("CreateTaskRequest");

const listTasksQuerySchema = z
	.object({
		assigneeId: z.string().optional(),
		projectId: z.string().optional(),
	})
	.openapi("ListTasksQuery");

// Resolver que obtiene el proyecto de una tarea por su id.
const taskProjectResolver: ProjectIdResolver = async (c) => {
	const task = await prisma.task.findUnique({
		where: { id: c.req.param("id") },
	});
	return task?.projectId ?? null;
};

const taskEditors = ["TEAM_DEVELOPER", "SCRUM_MASTER", "PRODUCT_OWNER"];

const authenticated = [authenticateToken];
const taskWrite = [authenticateToken, requireProjectRole(taskEditors)];
const taskWriteById = [
	authenticateToken,
	requireProjectRole(taskEditors, taskProjectResolver),
];
const adminOnly = [authenticateToken, requireSystemRole("ADMIN")];

const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });

const listTasksRoute = createRoute({
	method: "get",
	path: "/api/tasks",
	tags: ["Tasks"],
	summary: "Listar tareas (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { query: listTasksQuerySchema },
	responses: {
		200: {
			description: "Listado de tareas",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getTaskRoute = createRoute({
	method: "get",
	path: "/api/tasks/{id}",
	tags: ["Tasks"],
	summary: "Obtener una tarea por id (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Tarea encontrada",
			content: { "application/json": { schema: dataSchema } },
		},
		404: {
			description: "Tarea no encontrada",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const createTaskRoute = createRoute({
	method: "post",
	path: "/api/tasks",
	tags: ["Tasks"],
	summary: "Crear tarea (cualquier miembro del proyecto)",
	middleware: taskWrite,
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: taskCreateSchema } },
		},
	},
	responses: {
		201: {
			description: "Tarea creada",
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

const updateTaskRoute = createRoute({
	method: "put",
	path: "/api/tasks/{id}",
	tags: ["Tasks"],
	summary: "Actualizar tarea (cualquier miembro del proyecto)",
	middleware: taskWriteById,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Tarea actualizada",
			content: { "application/json": { schema: dataSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const deleteTaskRoute = createRoute({
	method: "delete",
	path: "/api/tasks/{id}",
	tags: ["Tasks"],
	summary: "Eliminar tarea (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Tarea eliminada",
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

const evaluateTaskRoute = createRoute({
	method: "post",
	path: "/api/tasks/{id}/evaluate",
	tags: ["Tasks"],
	summary: "Evaluar tarea (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		201: {
			description: "Evaluación guardada",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Faltan campos requeridos",
			content: { "application/json": { schema: errorSchema } },
		},
		404: {
			description: "Tarea no encontrada",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerTaskRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listTasksRoute, async (c) => {
		try {
			const { assigneeId, projectId } = c.req.valid("query");
			const where: Record<string, string> = {};

			if (assigneeId) where.assigneeId = String(assigneeId);
			if (projectId) where.projectId = String(projectId);

			const tasks = await prisma.task.findMany({
				where,
				include: {
					assignee: {
						select: { id: true, name: true, email: true },
					},
					project: {
						select: { id: true, name: true },
					},
					evaluations: true,
				},
			});
			return c.json({ data: tasks }, 200);
		} catch {
			return c.json({ error: "Error al obtener tareas" }, 500);
		}
	});

	app.openapi(getTaskRoute, async (c) => {
		try {
			const task = await prisma.task.findUnique({
				where: { id: c.req.valid("param").id },
				include: {
					assignee: {
						select: { id: true, name: true, email: true },
					},
					project: {
						select: { id: true, name: true },
					},
					evaluations: true,
				},
			});
			if (!task) {
				return c.json({ error: "Tarea no encontrada" }, 404);
			}
			return c.json({ data: task }, 200);
		} catch {
			return c.json({ error: "Error al obtener tarea" }, 500);
		}
	});

	app.openapi(
		createTaskRoute,
		async (c) => {
			try {
				const {
					title,
					description,
					projectId,
					assigneeId,
					priority,
					deadline,
					status,
					sprintId,
					userStoryId,
				} = c.req.valid("json");

				const task = await prisma.task.create({
					data: {
						title,
						description,
						projectId,
						assigneeId,
						priority: priority || "MEDIUM",
						deadline: deadline ? new Date(deadline) : null,
						status: status || "TODO",
						sprintId: sprintId || null,
						userStoryId: userStoryId || null,
					},
				});

				if (assigneeId) {
					await notify({
						userId: assigneeId,
						type: "TASK_ASSIGNED",
						title: "Nueva Tarea Asignada",
						message: `Se te ha asignado la tarea: ${title}`,
						entityType: "TASK",
						entityId: task.id,
					});
				}

				return c.json({ data: task }, 201);
			} catch {
				return c.json({ error: "Error al crear tarea" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos inválidos" }, 400);
			}
		},
	);

	app.openapi(updateTaskRoute, async (c) => {
		try {
			// La API original no valida el body aquí: se aplica tal cual (menos
			// `deadline` y `status`, que se normalizan) sobre `prisma.task.update`.
			const body = (await c.req.json().catch(() => ({}))) as Record<
				string,
				unknown
			>;
			const { deadline, status, ...updateData } = body;

			const dataToUpdate: Record<string, unknown> = { ...updateData };

			if (deadline) dataToUpdate.deadline = new Date(deadline as string);
			if (status) {
				dataToUpdate.status = status;
				if (status === "COMPLETED" || status === "DONE") {
					dataToUpdate.completedAt = new Date();
				} else if (
					status === "TODO" ||
					status === "IN_PROGRESS" ||
					status === "PENDING"
				) {
					dataToUpdate.completedAt = null;
				}
			}

			const task = await prisma.task.update({
				where: { id: c.req.valid("param").id },
				data: dataToUpdate,
			});
			return c.json({ data: task }, 200);
		} catch {
			return c.json({ error: "Error al actualizar tarea" }, 500);
		}
	});

	app.openapi(deleteTaskRoute, async (c) => {
		try {
			await prisma.task.delete({
				where: { id: c.req.valid("param").id },
			});
			return c.json({ data: { message: "Tarea eliminada" } }, 200);
		} catch {
			return c.json({ error: "Error al eliminar tarea" }, 500);
		}
	});

	app.openapi(evaluateTaskRoute, async (c) => {
		try {
			const body = (await c.req.json().catch(() => ({}))) as {
				score?: number;
				feedback?: string;
				evaluatorId?: string;
				criteriaScores?: { criteriaId: string; score: number }[];
			};
			const taskId = c.req.valid("param").id;

			if (body.score === undefined || !body.evaluatorId) {
				return c.json({ error: "Faltan campos requeridos" }, 400);
			}

			const task = await prisma.task.findUnique({ where: { id: taskId } });
			if (!task) {
				return c.json({ error: "Tarea no encontrada" }, 404);
			}

			const evaluation = await prisma.$transaction(async (tx) => {
				const newEvaluation = await tx.evaluation.create({
					data: {
						taskId,
						projectId: task.projectId,
						evaluatorId: body.evaluatorId as string,
						score: body.score,
						feedback: body.feedback,
						status: "COMPLETED",
					},
				});

				if (body.criteriaScores && Array.isArray(body.criteriaScores)) {
					await tx.evaluationCriteria.createMany({
						data: body.criteriaScores.map((cs) => ({
							evaluationId: newEvaluation.id,
							criteriaId: cs.criteriaId,
							score: cs.score,
						})),
					});
				}

				return newEvaluation;
			});

			if (task.assigneeId) {
				await notify({
					userId: task.assigneeId,
					type: "EVALUATION_COMPLETED",
					title: "Tarea Evaluada",
					message: `Tu tarea "${task.title}" ha sido evaluada con ${body.score}/100`,
					entityType: "TASK",
					entityId: task.id,
				});
			}

			return c.json({ data: evaluation }, 201);
		} catch (error) {
			console.error("Error al evaluar tarea:", error);
			return c.json({ error: "Error al guardar la evaluación" }, 500);
		}
	});
};
