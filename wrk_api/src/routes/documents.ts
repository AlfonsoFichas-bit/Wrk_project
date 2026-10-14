import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import {
	type ProjectIdResolver,
	requireProjectRole,
} from "../middleware/project-rbac.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("DocumentErrorResponse");

const projectParamSchema = z.object({ projectId: z.string() });
const idParamSchema = z.object({ id: z.string() });

const ALLOWED_MIME_TYPES = [
	"application/pdf",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/msword",
	"image/png",
	"image/jpeg",
	"image/gif",
	"text/plain",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-excel",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOADS_DIR = "uploads";

// Resolver del DELETE: el proyecto del documento.
const documentProjectResolver: ProjectIdResolver = async (c) => {
	const doc = await prisma.document.findUnique({
		where: { id: c.req.param("id") },
	});
	return doc?.projectId ?? null;
};

const documentRoles = ["TEAM_DEVELOPER", "SCRUM_MASTER", "PRODUCT_OWNER"];

const authenticated = [authenticateToken];
const member = [authenticateToken, requireProjectRole(documentRoles)];
const memberById = [
	authenticateToken,
	requireProjectRole(documentRoles, documentProjectResolver),
];

const dataArraySchema = z.object({ data: z.array(z.unknown()) });
const documentSchema = z.unknown().openapi("DocumentResponse");
const messageSchema = z
	.object({ message: z.string() })
	.openapi("DocumentMessageResponse");

type UploadResult =
	| { ok: true; name: string; type: string; size: number; url: string }
	| { ok: false; status: 400 | 413 | 415; error: string };

const isFile = (value: unknown): value is File =>
	typeof value === "object" &&
	value !== null &&
	"arrayBuffer" in value &&
	"name" in value &&
	"size" in value &&
	"type" in value;

/**
 * Extrae el archivo del formulario multipart, aplicando las mismas reglas que
 * multer en la API original: existencia, tipo permitido y límite de 10MB.
 * Guarda el archivo en `uploads/` y devuelve los metadatos para Prisma.
 */
const extractUpload = async (
	formData: Record<string, string | File | (string | File)[]>,
): Promise<UploadResult> => {
	const file = formData.file;

	if (!isFile(file)) {
		return { ok: false, status: 400, error: "No se envió archivo" };
	}

	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return { ok: false, status: 415, error: "Tipo de archivo no permitido" };
	}

	if (file.size > MAX_FILE_SIZE) {
		return {
			ok: false,
			status: 413,
			error: "Archivo excede el límite de 10MB",
		};
	}

	mkdirSync(UPLOADS_DIR, { recursive: true });
	const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
	const storedName = `${uniqueSuffix}-${file.name}`;
	const buffer = Buffer.from(await file.arrayBuffer());
	writeFileSync(path.join(UPLOADS_DIR, storedName), buffer);

	const type = file.type.split("/").pop()?.toUpperCase() || "FILE";

	return {
		ok: true,
		name: file.name,
		type,
		size: file.size,
		url: `/api/files/${storedName}`,
	};
};

const listDocumentsRoute = createRoute({
	method: "get",
	path: "/api/documents/{projectId}",
	tags: ["Documents"],
	summary: "Documentos de un proyecto (miembros)",
	middleware: member,
	request: { params: projectParamSchema },
	responses: {
		200: {
			description: "Documentos del proyecto",
			content: { "application/json": { schema: dataArraySchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const uploadDocumentRoute = createRoute({
	method: "post",
	path: "/api/documents/{projectId}",
	tags: ["Documents"],
	summary: "Subir documento a un proyecto (miembros)",
	middleware: member,
	request: { params: projectParamSchema },
	responses: {
		201: {
			description: "Documento creado",
			content: { "application/json": { schema: documentSchema } },
		},
		400: {
			description: "No se envió archivo",
			content: { "application/json": { schema: errorSchema } },
		},
		413: {
			description: "Archivo demasiado grande",
			content: { "application/json": { schema: errorSchema } },
		},
		415: {
			description: "Tipo no permitido",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const uploadVersionRoute = createRoute({
	method: "post",
	path: "/api/documents/{id}/versions",
	tags: ["Documents"],
	summary: "Subir una nueva versión de un documento (miembros)",
	middleware: memberById,
	request: { params: idParamSchema },
	responses: {
		201: {
			description: "Versión creada",
			content: { "application/json": { schema: documentSchema } },
		},
		400: {
			description: "Datos inválidos",
			content: { "application/json": { schema: errorSchema } },
		},
		404: {
			description: "Documento no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		413: {
			description: "Archivo demasiado grande",
			content: { "application/json": { schema: errorSchema } },
		},
		415: {
			description: "Tipo no permitido",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const versionHistoryRoute = createRoute({
	method: "get",
	path: "/api/documents/{id}/versions",
	tags: ["Documents"],
	summary: "Historial de versiones de un documento",
	middleware: authenticated,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Historial de versiones",
			content: { "application/json": { schema: dataArraySchema } },
		},
		404: {
			description: "Documento no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

const deleteDocumentRoute = createRoute({
	method: "delete",
	path: "/api/documents/{id}",
	tags: ["Documents"],
	summary: "Eliminar documento (SCRUM_MASTER, PRODUCT_OWNER)",
	middleware: memberById,
	request: { params: idParamSchema },
	responses: {
		200: {
			description: "Documento eliminado",
			content: { "application/json": { schema: messageSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerDocumentRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(listDocumentsRoute, async (c) => {
		try {
			const { projectId } = c.req.valid("param");
			const documents = await prisma.document.findMany({
				where: {
					projectId,
					parentId: null,
				},
				include: {
					versions: {
						orderBy: { version: "desc" },
					},
				},
				orderBy: { uploadedAt: "desc" },
			});

			const result = documents.map((doc) => {
				const maxVersion =
					doc.versions.length > 0
						? Math.max(...doc.versions.map((v) => v.version), doc.version)
						: doc.version;

				return {
					...doc,
					latestVersion: maxVersion,
					versionCount: doc.versions.length + 1,
				};
			});

			return c.json({ data: result }, 200);
		} catch (_error) {
			return c.json({ error: "Error al obtener documentos" }, 500);
		}
	});

	app.openapi(uploadDocumentRoute, async (c) => {
		try {
			const { projectId } = c.req.valid("param");
			const formData = await c.req.parseBody();
			const upload = await extractUpload(formData);

			if (!upload.ok) {
				return c.json({ error: upload.error }, upload.status);
			}

			const existingDoc = await prisma.document.findFirst({
				where: {
					projectId,
					name: upload.name,
					parentId: null,
				},
				include: {
					versions: {
						orderBy: { version: "desc" },
						take: 1,
					},
				},
			});

			if (existingDoc) {
				const lastVersion =
					existingDoc.versions.length > 0
						? existingDoc.versions[0].version
						: existingDoc.version;
				const newVersion = lastVersion + 1;

				const version = await prisma.document.create({
					data: {
						projectId,
						name: upload.name,
						type: upload.type,
						size: upload.size,
						url: upload.url,
						version: newVersion,
						parentId: existingDoc.id,
					},
				});
				return c.json(version, 201);
			}

			const document = await prisma.document.create({
				data: {
					projectId,
					name: upload.name,
					type: upload.type,
					size: upload.size,
					url: upload.url,
					version: 1,
				},
			});

			return c.json(document, 201);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error al subir documento" }, 500);
		}
	});

	app.openapi(uploadVersionRoute, async (c) => {
		try {
			const documentId = c.req.valid("param").id;
			const formData = await c.req.parseBody();
			const upload = await extractUpload(formData);

			if (!upload.ok) {
				return c.json({ error: upload.error }, upload.status);
			}

			const parentDoc = await prisma.document.findUnique({
				where: { id: documentId },
				include: {
					versions: {
						orderBy: { version: "desc" },
						take: 1,
					},
				},
			});

			if (!parentDoc) {
				return c.json({ error: "Documento original no encontrado" }, 404);
			}

			if (parentDoc.parentId) {
				return c.json(
					{
						error:
							"No se puede crear una versión de una versión. Use el ID del documento original.",
					},
					400,
				);
			}

			const lastVersion =
				parentDoc.versions.length > 0
					? parentDoc.versions[0].version
					: parentDoc.version;
			const newVersion = lastVersion + 1;

			const document = await prisma.document.create({
				data: {
					projectId: parentDoc.projectId,
					name: upload.name,
					type: upload.type,
					size: upload.size,
					url: upload.url,
					version: newVersion,
					parentId: parentDoc.id,
				},
			});

			return c.json(document, 201);
		} catch (error) {
			console.error(error);
			return c.json({ error: "Error al crear nueva versión" }, 500);
		}
	});

	app.openapi(versionHistoryRoute, async (c) => {
		try {
			const documentId = c.req.valid("param").id;
			const doc = await prisma.document.findUnique({
				where: { id: documentId },
			});

			if (!doc) {
				return c.json({ error: "Documento no encontrado" }, 404);
			}

			const parentId = doc.parentId || doc.id;

			const history = await prisma.document.findMany({
				where: {
					OR: [{ id: parentId }, { parentId: parentId }],
				},
				orderBy: { version: "desc" },
			});

			return c.json({ data: history }, 200);
		} catch (_error) {
			return c.json({ error: "Error al obtener versiones" }, 500);
		}
	});

	app.openapi(deleteDocumentRoute, async (c) => {
		try {
			await prisma.document.delete({
				where: { id: c.req.valid("param").id },
			});
			return c.json({ message: "Documento eliminado" }, 200);
		} catch (_error) {
			return c.json({ error: "Error al eliminar documento" }, 500);
		}
	});
};
