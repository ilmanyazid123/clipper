/**
 * Seed akun admin ke database (Neon Postgres).
 * Idempoten: aman dijalankan berulang (upsert by email).
 *
 * Variabel env (lihat .env):
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_CREDITS
 *
 * Jalankan: bun scripts/seed-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const credits = Number(process.env.ADMIN_CREDITS ?? "100");

  if (!email || !password) {
    console.error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi di .env");
    process.exit(1);
  }

  const admin = await db.user.upsert({
    where: { email },
    update: {
      password: hashPassword(password),
      role: "admin",
      credits,
    },
    create: {
      email,
      name: "Admin",
      password: hashPassword(password),
      role: "admin",
      credits,
    },
  });

  console.log("Admin siap:");
  console.log("  id      :", admin.id);
  console.log("  email   :", admin.email);
  console.log("  role    :", admin.role);
  console.log("  credits :", admin.credits);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
