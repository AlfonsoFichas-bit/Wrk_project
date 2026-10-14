import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { notify } from "../lib/notify.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireSystemRole } from "../middleware/system-rbac.js";
import type { AppEnv } from "../types.js";

const PROJECT_ROLE_VALUES = [
	"SCRUM_MASTER",
	"PRODUCT_OWNER",
	"TEAM_DEVELOPER",
] as const;

const errorSchema = z
	.object({ error: z.string() })
	.openapi("ProjectErrorResponse");

const messageSchema = z.object({ message: z.string() });

const projectSchema = z
	.object({
		name: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		ownerId: z.string(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
	})
	.openapi("CreateProjectRequest");

const projectUpdateSchema = z
	.object({
		name: z.string().min(1).max(200).optional(),
		description: z.string().max(2000).optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
	})
	.openapi("UpdateProjectRequest");

const memberSchema = z
	.object({
		userId: z.string(),
		role: z.enum(PROJECT_ROLE_VALUES),
	})
	.openapi("AddProjectMemberRequest");

const idParamSchema = z.object({ id: z.string() });
const memberParamSchema = z.object({ id: z.string(), userId: z.string() });
const listQuerySchema = z.object({ memberId: z.string().optional() });

const authenticated = [authenticateToken];
const adminOnly = [authenticateToken, requireSystemRole("ADMIN")];

// Nota: la API original devuelve mensajes genéricos en los proyectos (no el
// primer issue de Zod). Cada ruta declara su hook de validación inline para
// conservar esos mensajes exactos.

const listProjectsRoute = createRoute({
	method: "get",
	path: "/api/projects",
	tags: ["Projects"],
	summary: "Listar proyectos (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { query: listQuerySchema },
	responses: {
		200: {
			description: "Listado de proyectos",
			content: { "application/json": { schema: z.array(z.unknown()) } },
		},
		401: {
			description: "No autorizado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const getProjectRoute = createRoute({
	method: "get",
	path: "/api/projects/{id}",
	tags: ["Projects"],
	summary: "Obtener un proyecto por id (cualquier usuario autenticado)",
	middleware: authenticated,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Proyecto encontrado",
			content: {
				"application/json": { schema: z.object({ data: z.unknown() }) },
			},
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

const createProjectRoute = createRoute({
	method: "post",
	path: "/api/projects",
	tags: ["Projects"],
	summary: "Crear proyecto (solo ADMIN)",
	middleware: adminOnly,
	request: {
		body: {
			required: true,
			content: { "application/json": { schema: projectSchema } },
		},
	},
	responses: {
		201: {
			description: "Proyecto creado",
			content: {
				"application/json": { schema: z.object({ data: z.unknown() }) },
			},
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

const updateProjectRoute = createRoute({
	method: "put",
	path: "/api/projects/{id}",
	tags: ["Projects"],
	summary: "Actualizar proyecto (solo ADMIN)",
	middleware: adminOnly,
	request: {
		params: idParamSchema,
		body: {
			required: true,
			content: { "application/json": { schema: projectUpdateSchema } },
		},
	},
	responses: {
		200: {
			description: "Proyecto actualizado",
			content: {
				"application/json": { schema: z.object({ data: z.unknown() }) },
			},
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

const addMemberRoute = createRoute({
	method: "post",
	path: "/api/projects/{id}/members",
	tags: ["Projects"],
	summary: "Asignar miembro a un proyecto (solo ADMIN)",
	middleware: adminOnly,
	request: {
		params: idParamSchema,
		body: {
			required: true,
			content: { "application/json": { schema: memberSchema } },
		},
	},
	responses: {
		200: {
			description: "Rol del miembro actualizado",
			content: {
				"application/json": {
					schema: z.object({ data: z.unknown(), message: z.string() }),
				},
			},
		},
		201: {
			description: "Miembro añadido",
			content: {
				"application/json": { schema: z.object({ data: z.unknown() }) },
			},
		},
		400: {
			description: "userId y role requeridos",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const removeMemberRoute = createRoute({
	method: "delete",
	path: "/api/projects/{id}/members/{userId}",
	tags: ["Projects"],
	summary: "Eliminar un miembro de un proyecto (solo ADMIN)",
	middleware: adminOnly,
	request: { params: memberParamSchema },
	responses: {
		200: {
			description: "Miembro eliminado",
			content: { "application/json": { schema: messageSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const deleteProjectRoute = createRoute({
	method: "delete",
	path: "/api/projects/{id}",
	tags: ["Projects"],
	summary: "Eliminar un proyecto (solo ADMIN)",
	middleware: adminOnly,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Proyecto eliminado",
			content: {
				"application/json": {
					schema: z.object({ data: messageSchema }),
				},
			},
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerProjectRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listProjectsRoute, async (c) => {
		try {
			const { memberId } = c.req.valid("query");
			const whereClause = memberId
				? {
						OR: [
							{ ownerId: String(memberId) },
							{ members: { some: { userId: String(memberId) } } },
						],
					}
				: {};

			const projects = await prisma.project.findMany({
				where: whereClause,
				include: {
					owner: {
						select: { id: true, name: true, email: true },
					},
					members: true,
					sprints: true,
				},
			});
			return c.json(projects, 200);
		} catch (error) {
			console.error("Error al obtener proyectos:", error);
			return c.json({ error: "Error al obtener proyectos" }, 500);
		}
	});

	app.openapi(getProjectRoute, async (c) => {
		try {
			const project = await prisma.project.findUnique({
				where: { id: c.req.valid("param").id },
				include: {
					owner: {
						select: { id: true, name: true, email: true },
					},
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									role: true,
									avatar: true,
								},
							},
						},
					},
					sprints: true,
					userStories: true,
					tasks: true,
				},
			});
			if (!project) {
				return c.json({ error: "Proyecto no encontrado" }, 404);
			}
			return c.json({ data: project }, 200);
		} catch (error) {
			console.error("Error al obtener proyecto:", error);
			return c.json({ error: "Error al obtener proyecto" }, 500);
		}
	});

	app.openapi(
		createProjectRoute,
		async (c) => {
			try {
				const { name, description, ownerId, startDate, endDate } =
					c.req.valid("json");

				const project = await prisma.project.create({
					data: {
						name,
						description,
						ownerId,
						startDate: startDate ? new Date(startDate) : undefined,
						endDate: endDate ? new Date(endDate) : undefined,
					},
				});
				return c.json({ data: project }, 201);
			} catch (error) {
				console.error("Error al crear proyecto:", error);
				return c.json({ error: "Error al crear proyecto" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos inválidos" }, 400);
			}
		},
	);

	app.openapi(
		updateProjectRoute,
		async (c) => {
			try {
				const { name, description, startDate, endDate } = c.req.valid("json");

				const project = await prisma.project.update({
					where: { id: c.req.valid("param").id },
					data: {
						...(name !== undefined && { name }),
						...(description !== undefined && { description }),
						...(startDate !== undefined && { startDate: new Date(startDate) }),
						...(endDate !== undefined && { endDate: new Date(endDate) }),
					},
				});
				return c.json({ data: project }, 200);
			} catch (error) {
				console.error("Error al actualizar proyecto:", error);
				return c.json({ error: "Error al actualizar proyecto" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json({ error: "Datos inválidos" }, 400);
			}
		},
	);

	app.openapi(
		addMemberRoute,
		async (c) => {
			try {
				const projectId = c.req.valid("param").id;
				const { userId, role } = c.req.valid("json");

				// Si ya es miembro, solo se actualiza el rol
				const existingMember = await prisma.projectMember.findUnique({
					where: {
						projectId_userId: { projectId, userId },
					},
				});

				if (existingMember) {
					const updatedMember = await prisma.projectMember.update({
						where: { id: existingMember.id },
						data: { role },
					});
					return c.json(
						{ data: updatedMember, message: "Rol actualizado" },
						200,
					);
				}

				const member = await prisma.projectMember.create({
					data: { projectId, userId, role },
					include: {
						project: { select: { name: true } },
					},
				});

				// Notificar al usuario
				await notify({
					userId,
					type: "PROJECT_ASSIGNED",
					title: "Nuevo Proyecto Asignado",
					message: `Has sido añadido al proyecto "${member.project.name}" como ${role}`,
					entityType: "PROJECT",
					entityId: projectId,
				});

				return c.json({ data: member }, 201);
			} catch (error) {
				console.error("Error al asignar miembro:", error);
				return c.json({ error: "Error al asignar miembro" }, 500);
			}
		},
		(result, c) => {
			if (!result.success) {
				return c.json(
					{ error: "Datos inválidos: userId y role requeridos" },
					400,
				);
			}
		},
	);

	app.openapi(removeMemberRoute, async (c) => {
		try {
			const { id: projectId, userId } = c.req.valid("param");
			await prisma.projectMember.delete({
				where: {
					projectId_userId: { projectId, userId },
				},
			});
			return c.json({ message: "Miembro eliminado del proyecto" }, 200);
		} catch (error) {
			console.error("Error al eliminar miembro:", error);
			return c.json({ error: "Error al eliminar miembro" }, 500);
		}
	});

	app.openapi(deleteProjectRoute, async (c) => {
		try {
			await prisma.project.delete({
				where: { id: c.req.valid("param").id },
			});
			return c.json({ data: { message: "Proyecto eliminado" } }, 200);
		} catch (error) {
			console.error("Error al eliminar proyecto:", error);
			return c.json({ error: "Error al eliminar proyecto" }, 500);
		}
	});
};
