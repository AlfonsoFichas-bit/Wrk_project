import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireSystemRole } from "../middleware/system-rbac.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("RubricErrorResponse");

const idParamSchema = z.object({ id: z.string() });

const rubricCreateSchema = z
	.object({
		projectId: z.string().nullable().optional(),
		name: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		criteria: z.array(
			z.object({
				name: z.string().min(1),
				maxScore: z.number().min(1),
				weight: z.number().min(0),
			}),
		),
	})
	.openapi("CreateRubricRequest");

const listRubricsQuerySchema = z
	.object({ projectId: z.string().optional() })
	.openapi("ListRubricsQuery");

const authenticated = [authenticateToken];
const adminOnly = [authenticateToken, requireSystemRole("ADMIN")];

const dataSchema = z.object({ data: z.unknown() });
const dataArraySchema = z.object({ data: z.array(z.unknown()) });

const listRubricsRoute = createRoute({
	method: "get",
	path: "/api/rubrics",
	tags: ["Rubrics"],
	summary: "Listar rúbricas (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { query: listRubricsQuerySchema },
	responses: {
		200: {
			description: "Listado de rúbricas",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const createRubricRoute = createRoute({
	method: "post",
	path: "/api/rubrics",
	tags: ["Rubrics"],
	summary: "Crear rúbrica (solo ADMIN)",
	middleware: adminOnly,
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: rubricCreateSchema } },
		},
	},
	responses: {
		201: {
			description: "Rúbrica creada",
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

const updateRubricRoute = createRoute({
	method: "put",
	path: "/api/rubrics/{id}",
	tags: ["Rubrics"],
	summary: "Actualizar rúbrica (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Rúbrica actualizada",
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

const deleteRubricRoute = createRoute({
	method: "delete",
	path: "/api/rubrics/{id}",
	tags: ["Rubrics"],
	summary: "Eliminar rúbrica (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Rúbrica eliminada",
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

interface RubricCriterionInput {
	id?: string;
	name: string;
	maxScore: number;
	weight: number;
}

export const registerRubricRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listRubricsRoute, async (c) => {
		try {
			const { projectId } = c.req.valid("query");

			const whereClause = projectId
				? { OR: [{ projectId }, { projectId: null }] }
				: { projectId: null };

			const rubrics = await prisma.rubric.findMany({
				where: whereClause,
				include: { criteria: true },
				orderBy: { createdAt: "desc" },
			});

			return c.json({ data: rubrics }, 200);
		} catch (error) {
			console.error("Error getting rubrics:", error);
			return c.json({ error: "Error al obtener rúbricas" }, 500);
		}
	});

	app.openapi(
		createRubricRoute,
		async (c) => {
			try {
				const { projectId, name, description, criteria } = c.req.valid("json");

				const rubric = await prisma.rubric.create({
					data: {
						projectId: projectId || null,
						name,
						description,
						criteria: {
							create: criteria.map((c) => ({
								name: c.name,
								maxScore: Number(c.maxScore) || 10,
								weight: Number(c.weight) || 1,
							})),
						},
					},
					include: { criteria: true },
				});

				return c.json({ data: rubric }, 201);
			} catch (error) {
				console.error("Error creating rubric:", error);
				return c.json({ error: "Error al crear rúbrica" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos inválidos" }, 400);
			}
		},
	);

	app.openapi(updateRubricRoute, async (c) => {
		try {
			const rubricId = c.req.valid("param").id;
			const body = (await c.req.json().catch(() => ({}))) as {
				name?: string;
				description?: string;
				criteria?: RubricCriterionInput[];
			};
			const { name, description, criteria } = body;

			if (!name || !criteria || !Array.isArray(criteria)) {
				return c.json({ error: "Datos inválidos" }, 400);
			}

			const updatedRubric = await prisma.$transaction(async (tx) => {
				await tx.rubric.update({
					where: { id: rubricId },
					data: { name, description },
				});

				const existingCriteria = await tx.criteria.findMany({
					where: { rubricId },
					select: { id: true },
				});
				const existingIds = existingCriteria.map((c) => c.id);

				const requestIds = criteria
					.filter((c) => c.id && existingIds.includes(c.id))
					.map((c) => c.id);

				const toDelete = existingIds.filter((id) => !requestIds.includes(id));
				if (toDelete.length > 0) {
					await tx.criteria.deleteMany({
						where: { id: { in: toDelete } },
					});
				}

				for (const criterion of criteria) {
					if (criterion.id && existingIds.includes(criterion.id)) {
						await tx.criteria.update({
							where: { id: criterion.id },
							data: {
								name: criterion.name,
								maxScore: Number(criterion.maxScore),
								weight: Number(criterion.weight),
							},
						});
					} else {
						await tx.criteria.create({
							data: {
								rubricId,
								name: criterion.name,
								maxScore: Number(criterion.maxScore) || 10,
								weight: Number(criterion.weight) || 1,
							},
						});
					}
				}

				return tx.rubric.findUnique({
					where: { id: rubricId },
					include: { criteria: true },
				});
			});

			return c.json({ data: updatedRubric }, 200);
		} catch (error) {
			console.error("Error updating rubric:", error);
			return c.json({ error: "Error al actualizar rúbrica" }, 500);
		}
	});

	app.openapi(deleteRubricRoute, async (c) => {
		try {
			await prisma.rubric.delete({
				where: { id: c.req.valid("param").id },
			});
			return c.json({ message: "Rúbrica eliminada" }, 200);
		} catch (error) {
			console.error("Error deleting rubric:", error);
			return c.json({ error: "Error al eliminar rúbrica" }, 500);
		}
	});
};
