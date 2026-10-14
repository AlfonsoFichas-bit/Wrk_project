import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

// biome-ignore lint/suspicious/noImplicitAnyLet: Adapter type depends on implementation
let adapter;
if (connectionString?.startsWith("postgresql")) {
	adapter = new PrismaPg(new Pool({ connectionString }));
} else if (connectionString?.startsWith("file:")) {
	adapter = new PrismaBetterSqlite3({ url: connectionString });
}

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ["query", "error", "warn"],
		...(adapter && { adapter }),
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
