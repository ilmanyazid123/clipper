import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const PACKAGES: Record<
  string,
  { name: string; credits: number; priceIdr: number }
> = {
  starter: { name: "Starter", credits: 10, priceIdr: 25000 },
  creator: { name: "Creator", credits: 22, priceIdr: 50000 },
  pro: { name: "Pro", credits: 60, priceIdr: 99000 },
};

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const pkgKey = String(body.package || "");
    const pkg = PACKAGES[pkgKey];
    if (!pkg) {
      return NextResponse.json({ error: "Paket tidak dikenal." }, { status: 400 });
    }

    // Simulasi pembayaran berhasil (gateway di-production: Midtrans/Xendit)
    await db.user.update({
      where: { id: user.id },
      data: { credits: { increment: pkg.credits } },
    });
    await db.transaction.create({
      data: {
        userId: user.id,
        type: "TOPUP",
        credits: pkg.credits,
        packageName: pkg.name,
        priceIdr: pkg.priceIdr,
        description: `Top up paket ${pkg.name} — ${pkg.credits} kredit`,
      },
    });

    const fresh = await db.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });
    return NextResponse.json({
      ok: true,
      credits: fresh?.credits ?? 0,
      message: `Berhasil! ${pkg.credits} kredit dari paket ${pkg.name} telah ditambahkan.`,
    });
  } catch (err) {
    console.error("[topup]", err);
    return NextResponse.json(
      { error: "Gagal memproses top up." },
      { status: 500 },
    );
  }
}
