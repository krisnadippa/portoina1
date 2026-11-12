import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // Only in actual Vercel Linux serverless environment
  if (process.env.VERCEL && process.platform !== "win32") {
    const tmpDbPath = "/tmp/dev.db";
    const possibleSources = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(process.cwd(), "dev.db"),
    ];

    for (const src of possibleSources) {
      if (fs.existsSync(src)) {
        try {
          if (!fs.existsSync(tmpDbPath)) {
            fs.copyFileSync(src, tmpDbPath);
          }
          return `file:${tmpDbPath}`;
        } catch (err) {
          console.error("Gagal menyalin SQLite db ke /tmp:", err);
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  return process.env.DATABASE_URL || "file:./dev.db";
}

const databaseUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
