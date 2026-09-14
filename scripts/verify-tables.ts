import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  for (const m of ["user", "video", "clip", "transaction"]) {
    const count = await (db as any)[m].count();
    console.log(`${m}: ${count} rows`);
  }
}
main().finally(() => db.$disconnect());
