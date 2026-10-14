import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireSystemRole } from "../middleware/system-rbac.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("EvaluationErrorResponse");

const idParamSchema = z.object({ id: z.string() });
const taskParamSchema = z.object({ taskId: z.string() });
const sprintParamSchema = z.object({ sprintId: z.string() });
const projectParamSchema = z.object({ projectId: z.string() });
const studentParamSchema = z.object({ studentId: z.string() });

const authenticated = [authenticateToken];
const adminOnly = [authenticateToken, requireSystemRole("ADMIN")];

const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });

const getEvaluationRoute = createRoute({
	method: "get",
	path: "/api/evaluations/{id}",
	tags: ["Evaluations"],
	summary: "Obtener una evaluación por id (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Evaluación encontrada",
			content: { "application/json": { schema: dataSchema } },
		},
		404: {
			description: "Evaluación no encontrada",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getTaskEvaluationsRoute = createRoute({
	method: "get",
	path: "/api/evaluations/task/{taskId}",
	tags: ["Evaluations"],
	summary: "Evaluaciones de una tarea (solo ADMIN)",
	middleware: adminOnly,
	request: { params: taskParamSchema },
	responses: {
		200: {
			description: "Evaluaciones de la tarea",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getSprintEvaluationsRoute = createRoute({
	method: "get",
	path: "/api/evaluations/sprint/{sprintId}",
	tags: ["Evaluations"],
	summary: "Evaluaciones de un sprint (solo ADMIN)",
	middleware: adminOnly,
	request: { params: sprintParamSchema },
	responses: {
		200: {
			description: "Evaluaciones del sprint",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getProjectEvaluationsRoute = createRoute({
	method: "get",
	path: "/api/evaluations/project/{projectId}/general",
	tags: ["Evaluations"],
	summary: "Evaluaciones generales de un proyecto (solo ADMIN)",
	middleware: adminOnly,
	request: { params: projectParamSchema },
	responses: {
		200: {
			description: "Evaluaciones generales del proyecto",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getStudentEvaluationsRoute = createRoute({
	method: "get",
	path: "/api/evaluations/student/{studentId}",
	tags: ["Evaluations"],
	summary: "Evaluaciones de un estudiante (propias o ADMIN)",
	middleware: authenticated,
	request: { params: studentParamSchema },
	responses: {
		200: {
			description: "Evaluaciones del estudiante",
			content: { "application/json": { schema: dataArraySchema } },
		},
		403: {
			description: "Prohibido",
			content: { "text/plain": { schema: z.string() } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const createEvaluationRoute = createRoute({
	method: "post",
	path: "/api/evaluations",
	tags: ["Evaluations"],
	summary: "Crear evaluación (solo ADMIN)",
	middleware: adminOnly,
	responses: {
		201: {
			description: "Evaluación creada",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Datos inválidos",
			content: { "application/json": { schema: errorSchema } },
		},
		404: {
			description: "Evaluador no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const updateEvaluationRoute = createRoute({
	method: "put",
	path: "/api/evaluations/{id}",
	tags: ["Evaluations"],
	summary: "Actualizar evaluación (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Evaluación actualizada",
			content: { "application/json": { schema: dataSchema } },
		},
		400: {
			description: "Datos de criterios inválidos",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

interface EvaluationCriteriaScore {
	criteriaId?: string;
	score?: number;
	comment?: string;
}

interface EvaluationBody {
	projectId?: string;
	taskId?: string;
	sprintId?: string;
	evaluatorId?: string;
	feedback?: string;
	criteriaScores?: EvaluationCriteriaScore[];
	score?: number;
}

export const registerEvaluationRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(getEvaluationRoute, async (c) => {
		try {
			const evaluation = await prisma.evaluation.findUnique({
				where: { id: c.req.valid("param").id },
				include: {
					criteria: {
						include: { criteria: true },
					},
					evaluator: {
						select: { name: true, id: true },
					},
				},
			});
			if (!evaluation) {
				return c.json({ error: "Evaluación no encontrada" }, 404);
			}
			return c.json({ data: evaluation }, 200);
		} catch (error) {
			console.error("Error getting evaluation:", error);
			return c.json({ error: "Error al obtener evaluación" }, 500);
		}
	});

	app.openapi(getTaskEvaluationsRoute, async (c) => {
		try {
			const evaluations = await prisma.evaluation.findMany({
				where: { taskId: c.req.valid("param").taskId },
				include: {
					evaluator: {
						select: { name: true, id: true },
					},
					criteria: true,
				},
				orderBy: { createdAt: "desc" },
			});
			return c.json({ data: evaluations }, 200);
		} catch (error) {
			console.error("Error getting task evaluations:", error);
			return c.json({ error: "Error al obtener evaluaciones" }, 500);
		}
	});

	app.openapi(getSprintEvaluationsRoute, async (c) => {
		try {
			const evaluations = await prisma.evaluation.findMany({
				where: { sprintId: c.req.valid("param").sprintId },
				include: {
					evaluator: {
						select: { name: true, id: true },
					},
					criteria: true,
				},
				orderBy: { createdAt: "desc" },
			});
			return c.json({ data: evaluations }, 200);
		} catch (error) {
			console.error("Error getting sprint evaluations:", error);
			return c.json({ error: "Error al obtener evaluaciones" }, 500);
		}
	});

	app.openapi(getProjectEvaluationsRoute, async (c) => {
		try {
			const evaluations = await prisma.evaluation.findMany({
				where: {
					projectId: c.req.valid("param").projectId,
					taskId: null,
					sprintId: null,
				},
				include: {
					evaluator: {
						select: { name: true, id: true },
					},
					criteria: true,
				},
				orderBy: { createdAt: "desc" },
			});
			return c.json({ data: evaluations }, 200);
		} catch (error) {
			console.error("Error getting project evaluations:", error);
			return c.json({ error: "Error al obtener evaluaciones" }, 500);
		}
	});

	app.openapi(getStudentEvaluationsRoute, async (c) => {
		try {
			const studentId = c.req.valid("param").studentId;
			const user = c.get("user");

			if (user?.userId !== studentId && user?.role !== "ADMIN") {
				return c.text("Forbidden", 403);
			}

			const taskEvaluations = await prisma.evaluation.findMany({
				where: {
					task: { assigneeId: studentId },
				},
				include: {
					project: { select: { name: true } },
					task: { select: { title: true } },
					sprint: { select: { name: true } },
					evaluator: { select: { name: true } },
				},
			});

			const memberships = await prisma.projectMember.findMany({
				where: { userId: studentId },
				select: { projectId: true },
			});
			const projectIds = memberships.map((m) => m.projectId);

			const teamEvaluations = await prisma.evaluation.findMany({
				where: {
					projectId: { in: projectIds },
					taskId: null,
				},
				include: {
					project: { select: { name: true } },
					sprint: { select: { name: true } },
					evaluator: { select: { name: true } },
				},
			});

			const allEvaluations = [...taskEvaluations, ...teamEvaluations].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);

			return c.json({ data: allEvaluations }, 200);
		} catch (error) {
			console.error("Error getting student evaluations:", error);
			return c.json({ error: "Error al obtener mis calificaciones" }, 500);
		}
	});

	app.openapi(createEvaluationRoute, async (c) => {
		try {
			const body = (await c.req.json().catch(() => ({}))) as EvaluationBody;
			const {
				projectId,
				taskId,
				sprintId,
				evaluatorId,
				feedback,
				criteriaScores,
				score,
			} = body;

			if (!projectId || !evaluatorId || !Array.isArray(criteriaScores)) {
				return c.json({ error: "Datos inválidos: Faltan campos básicos" }, 400);
			}

			const user = await prisma.user.findUnique({ where: { id: evaluatorId } });
			if (!user) {
				return c.json({ error: "Evaluador no encontrado" }, 404);
			}

			const evaluation = await prisma.$transaction(async (tx) => {
				const evalRecord = await tx.evaluation.create({
					data: {
						projectId,
						taskId: taskId || null,
						sprintId: sprintId || null,
						evaluatorId,
						feedback,
						status: "COMPLETED",
					},
				});

				for (const criteriaScore of criteriaScores) {
					await tx.evaluationCriteria.create({
						data: {
							evaluationId: evalRecord.id,
							criteriaId: criteriaScore.criteriaId as string,
							score: criteriaScore.score,
							comment: criteriaScore.comment,
						},
					});
				}

				return tx.evaluation.update({
					where: { id: evalRecord.id },
					data: { score: score || 0 },
					include: { criteria: true },
				});
			});

			return c.json({ data: evaluation }, 201);
		} catch (error) {
			console.error("Error creating evaluation:", error);
			return c.json({ error: "Error al guardar evaluación" }, 500);
		}
	});

	app.openapi(updateEvaluationRoute, async (c) => {
		try {
			const evaluationId = c.req.valid("param").id;
			const body = (await c.req.json().catch(() => ({}))) as EvaluationBody;
			const { feedback, criteriaScores, score } = body;

			if (!Array.isArray(criteriaScores)) {
				return c.json({ error: "Datos de criterios inválidos" }, 400);
			}

			const updatedEvaluation = await prisma.$transaction(async (tx) => {
				await tx.evaluation.update({
					where: { id: evaluationId },
					data: {
						feedback,
						score,
					},
				});

				await tx.evaluationCriteria.deleteMany({
					where: { evaluationId },
				});

				for (const criteriaScore of criteriaScores) {
					await tx.evaluationCriteria.create({
						data: {
							evaluationId,
							criteriaId: criteriaScore.criteriaId as string,
							score: criteriaScore.score,
							comment: criteriaScore.comment,
						},
					});
				}

				return tx.evaluation.findUnique({
					where: { id: evaluationId },
					include: { criteria: true },
				});
			});

			return c.json({ data: updatedEvaluation }, 200);
		} catch (error) {
			console.error("Error updating evaluation:", error);
			return c.json({ error: "Error al actualizar evaluación" }, 500);
		}
	});
};
