import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Pilih URL database: pakai DATABASE_URL bila sudah Postgres.
 * Fallback ke DIRECT_DATABASE_URL bila shell menyisipkan DATABASE_URL
 * non-Postgres (mis. `file:` SQLite dari environment sandbox).
 */
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (url && /^postgres(ql)?:\/\//.test(url)) return url
  return process.env.DIRECT_DATABASE_URL ?? url
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: { db: { url: resolveDatabaseUrl() } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db