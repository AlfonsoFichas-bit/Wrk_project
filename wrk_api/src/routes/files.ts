import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { prisma } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const errorSchema = z
	.object({ error: z.string() })
	.openapi("FileErrorResponse");

const filenameParamSchema = z.object({ filename: z.string() });

const authenticated = [authenticateToken];

const textSchema = z.string().openapi("FileTextResponse");

const MIME_BY_EXT: Record<string, string> = {
	".pdf": "application/pdf",
	".doc": "application/msword",
	".docx":
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".xls": "application/vnd.ms-excel",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".txt": "text/plain; charset=utf-8",
};

const downloadFileRoute = createRoute({
	method: "get",
	path: "/api/files/{filename}",
	tags: ["Files"],
	summary: "Descargar un archivo subido (miembros del proyecto o ADMIN)",
	middleware: authenticated,
	request: { params: filenameParamSchema },
	responses: {
		200: {
			description: "Contenido del archivo",
			content: { "application/octet-stream": { schema: z.string() } },
		},
		403: {
			description: "Prohibido",
			content: { "text/plain": { schema: textSchema } },
		},
		404: {
			description: "Archivo no encontrado",
			content: { "application/json": { schema: errorSchema } },
		},
		500: {
			description: "Error interno",
			content: { "application/json": { schema: errorSchema } },
		},
	},
});

export const registerFileRoutes = (app: OpenAPIHono<AppEnv>): void => {
	app.openapi(downloadFileRoute, async (c) => {
		try {
			const { filename } = c.req.valid("param");
			const filePath = path.join("uploads", filename);

			if (!existsSync(filePath)) {
				return c.json({ error: "Archivo no encontrado" }, 404);
			}

			const document = await prisma.document.findFirst({
				where: { url: { contains: filename } },
			});

			if (!document) {
				return c.json({ error: "Documento no encontrado" }, 404);
			}

			// Acceso al proyecto (los ADMIN, docentes, acceden a todo)
			const user = c.get("user");
			if (user?.role !== "ADMIN") {
				const membership = await prisma.projectMember.findUnique({
					where: {
						projectId_userId: {
							projectId: document.projectId,
							userId: user?.userId || "",
						},
					},
				});
				if (!membership) {
					return c.text("Forbidden", 403);
				}
			}

			const contents = readFileSync(path.resolve(filePath));
			const arrayBuffer = Uint8Array.from(contents).buffer;
			const extension = path.extname(filename).toLowerCase();
			const contentType = MIME_BY_EXT[extension] ?? "application/octet-stream";

			return c.body(arrayBuffer, 200, { "Content-Type": contentType });
		} catch (error) {
			console.error("Error downloading file:", error);
			return c.json({ error: "Error al descargar archivo" }, 500);
		}
	});
};
