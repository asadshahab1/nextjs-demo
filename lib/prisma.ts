import { PrismaClient } from "@prisma/client";

// Singleton pattern. In dev, Next.js hot-reload would otherwise spin up a new
// PrismaClient on every reload and exhaust Postgres connections. On serverless
// (Vercel) reusing one client per warm instance keeps the pooled connection
// count sane. This is standard hygiene for Prisma + Next.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
