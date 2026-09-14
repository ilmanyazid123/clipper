import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Pilih URL database: pakai DATABASE_URL bila sudah Postgres.
 * Fallback ke DIRECT_DATABASE_URL bila shell menyisipkan DATABASE_URL
 * non-Postgres (mis. default `file:` SQLite dari environment sandbox).
 */
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (url && /^postgres(ql)?:\/\//.test(url)) return url
  return process.env.DIRECT_DATABASE_URL ?? url
}

function createClient(): PrismaClient {
  const url = resolveDatabaseUrl()
  return new PrismaClient({
    // Log query hanya di development; produksi cukup error agar log Vercel bersih.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
    // Override datasource HANYA bila URL valid ditemukan — jangan pernah
    // meneruskan `undefined` eksplisit (memicu PrismaClientConstructorValidationError).
    ...(url ? { datasources: { db: { url } } } : {}),
  })
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient()
  return globalForPrisma.prisma
}

/**
 * Proxy agar `db` dipakai persis seperti PrismaClient (db.user.findMany, dst.)
 * tanpa mengubah call site, sambil menunda pembuatan client hingga benar-benar
 * dipakai. Penting untuk build Vercel: saat `next build` mengevaluasi modul
 * route API ("collecting page data"), constructor tidak dijalankan sehingga
 * tidak butuh env database saat build.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient() as unknown as Record<string | symbol, unknown>
    const value = Reflect.get(client, prop)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
