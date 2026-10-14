import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { buildProjectReportCsv, projectReportFileName } from "../lib/csv.js";
import {
	computeBurndown,
	computeContribution,
	computeVelocity,
} from "../lib/metrics.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireSystemRole } from "../middleware/system-rbac.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("MetricsErrorResponse");

const sprintParamSchema = z.object({ sprintId: z.string() });
const projectParamSchema = z.object({ projectId: z.string() });
const exportQuerySchema = z
	.object({ sprintId: z.string().optional() })
	.openapi("ExportProjectQuery");

const authenticated = [authenticateToken];
const adminOnly = [authenticateToken, requireSystemRole("ADMIN")];

const dataSchema = z.object({ data: z.unknown() });

const burndownRoute = createRoute({
	method: "get",
	path: "/api/metrics/sprints/{sprintId}/burndown",
	tags: ["Metrics"],
	summary: "Burndown de un sprint (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { params: sprintParamSchema },
	responses: {
		200: {
			description: "Serie de burndown",
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

const contributionRoute = createRoute({
	method: "get",
	path: "/api/metrics/projects/{projectId}/contribution",
	tags: ["Metrics"],
	summary: "Contribución individual de un proyecto (solo ADMIN)",
	middleware: adminOnly,
	request: { params: projectParamSchema },
	responses: {
		200: {
			description: "Contribución por usuario",
			content: { "application/json": { schema: dataSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const velocityRoute = createRoute({
	method: "get",
	path: "/api/metrics/projects/{projectId}/velocity",
	tags: ["Metrics"],
	summary: "Velocidad de un proyecto (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { params: projectParamSchema },
	responses: {
		200: {
			description: "Velocidad por sprint",
			content: { "application/json": { schema: dataSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const exportProjectRoute = createRoute({
	method: "get",
	path: "/api/metrics/export/projects/{projectId}",
	tags: ["Metrics"],
	summary: "Exportar proyecto a CSV (solo ADMIN)",
	middleware: adminOnly,
	request: { params: projectParamSchema, query: exportQuerySchema },
	responses: {
		200: {
			description: "CSV del proyecto",
			content: { "text/csv": { schema: z.string() } },
		},
		400: {
			description: "Sprint no pertenece al proyecto",
			content: { "application/json": { schema: errorSchema } },
		},
		404: {
			description: "Proyecto no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerMetricRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(burndownRoute, async (c) => {
		try {
			const sprint = await prisma.sprint.findUnique({
				where: { id: c.req.valid("param").sprintId },
				include: {
					userStories: true,
				},
			});

			if (!sprint) {
				return c.json({ error: "Sprint not found" }, 404);
			}

			const metrics = computeBurndown(sprint);
			return c.json({ data: metrics }, 200);
		} catch (error) {
			console.error("Error fetching burndown:", error);
			return c.json({ error: "Error calculating metrics" }, 500);
		}
	});

	app.openapi(contributionRoute, async (c) => {
		try {
			const tasks = await prisma.task.findMany({
				where: {
					projectId: c.req.valid("param").projectId,
					status: "COMPLETED",
				},
				include: {
					assignee: {
						select: { id: true, name: true, email: true, avatar: true },
					},
				},
			});

			const data = computeContribution(tasks);
			return c.json({ data }, 200);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error fetching contributions" }, 500);
		}
	});

	app.openapi(velocityRoute, async (c) => {
		try {
			const sprints = await prisma.sprint.findMany({
				where: { projectId: c.req.valid("param").projectId },
				include: {
					userStories: true,
				},
				orderBy: { startDate: "asc" },
			});

			const velocityData = computeVelocity(sprints);
			return c.json({ data: velocityData }, 200);
		} catch (error) {
			console.error("Error fetching velocity:", error);
			return c.json({ error: "Error fetching velocity data" }, 500);
		}
	});

	app.openapi(exportProjectRoute, async (c) => {
		try {
			const projectId = c.req.valid("param").projectId;
			const sprintId = c.req.valid("query").sprintId || undefined;

			// `select` en lugar de `include`: el archivo solo necesita el nombre del
			// sprint, el título, estado y prioridad de la tarea y el nombre del
			// responsable. Con `include` se cargaba además el hash de contraseña.
			const project = await prisma.project.findUnique({
				where: { id: projectId },
				select: {
					sprints: {
						where: sprintId ? { id: sprintId } : undefined,
						select: {
							name: true,
							tasks: {
								select: {
									title: true,
									status: true,
									priority: true,
									assignee: { select: { name: true } },
								},
							},
						},
					},
				},
			});

			if (!project) {
				return c.json({ error: "Project not found" }, 404);
			}

			// Un sprint pedido que no aparece puede no existir o pertenecer a otro
			// proyecto. Se rechaza en lugar de devolver un archivo vacío, que el
			// docente tomaría por un informe completo del proyecto.
			if (sprintId && project.sprints.length === 0) {
				return c.json(
					{ error: "El sprint indicado no existe o no pertenece al proyecto" },
					400,
				);
			}

			const rows = project.sprints.flatMap((sprint) =>
				sprint.tasks.map((task) => ({
					sprint: sprint.name,
					title: task.title,
					assignee: task.assignee?.name || "Sin asignar",
					status: task.status,
					priority: task.priority,
					points: "N/A",
				})),
			);

			return c.body(buildProjectReportCsv(rows), 200, {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="${projectReportFileName(projectId)}"`,
			});
		} catch (error) {
			console.error("Error exporting data:", error);
			return c.json({ error: "Error exporting data" }, 500);
		}
	});
};
