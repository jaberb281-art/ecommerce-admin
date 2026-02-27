import { PrismaClient } from "@prisma/client"

// ------------------------------------------------------------------
// Prisma client singleton — prevents multiple instances in dev
// due to Next.js hot reloading creating new connections on every save
// ------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    })

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db
}