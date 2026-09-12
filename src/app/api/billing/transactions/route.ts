import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { TransactionDTO } from "@/lib/types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const data: TransactionDTO[] = items.map((t) => ({
    id: t.id,
    type: t.type,
    credits: t.credits,
    packageName: t.packageName,
    priceIdr: t.priceIdr,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));
  return NextResponse.json({ transactions: data, credits: user.credits });
}
