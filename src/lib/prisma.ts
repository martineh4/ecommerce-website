import { PrismaClient } from "@prisma/client";
import "./env";

// Attach the client to globalThis so hot-module replacement in dev doesn't
// spawn a new PrismaClient (and exhaust the DB connection pool) on every save.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Only cache on globalThis outside production — in prod each function instance
// is long-lived, so a module-level singleton already behaves correctly.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
