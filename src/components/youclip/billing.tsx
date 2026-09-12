"use client";

/* Halaman billing: top up paket kredit & riwayat transaksi. */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Logo } from "@/components/youclip/logo";
import { PACKAGES } from "@/components/youclip/landing";
import { api, formatIDR, navigate, timeAgo, useAuth } from "@/lib/client";
import type { TransactionDTO } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Check,
  Coins,
  CreditCard,
  Loader2,
  ShoppingCart,
  ReceiptText,
} from "lucide-react";

const TYPE_LABEL: Record<string, { text: string; cls: string }> = {
  TOPUP: { text: "Top Up", cls: "bg-primary/10 text-primary" },
  USAGE: { text: "Pemakaian", cls: "bg-amber-500/10 text-amber-600" },
  REFUND: { text: "Refund", cls: "bg-emerald-500/10 text-emerald-600" },
  BONUS: { text: "Bonus", cls: "bg-emerald-500/10 text-emerald-600" },
};

export function BillingPage() {
  const { user, refresh, loading: authLoading } = useAuth();
  const [txs, setTxs] = useState<TransactionDTO[] | null>(null);
  const [buying, setBuying] = useState<string | null>(null);

  const fetchTxs = useCallback(async () => {
    try {
      const data = await api<{ transactions: TransactionDTO[] }>(
        "/api/billing/transactions",
      );
      setTxs(data.transactions);
    } catch {
      setTxs([]);
    }
  }, []);

  useEffect(() => {
    if (user) fetchTxs();
  }, [user, fetchTxs]);

  async function buy(pkgKey: string) {
    setBuying(pkgKey);
    try {
      const res = await api<{ message: string }>("/api/billing/topup", {
        method: "POST",
        body: { package: pkgKey },
      });
      await refresh();
      await fetchTxs();
      toast({ title: "Top up berhasil!", description: res.message });
    } catch (err) {
      toast({
        title: "Gagal top up",
        description: err instanceof Error ? err.message : "Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setBuying(null);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-bold">Silakan masuk terlebih dahulu.</p>
        <Button onClick={() => navigate("/auth/signin")} className="rounded-full">
          Masuk
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </button>
            <Logo size="sm" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
            <Coins className="h-3.5 w-3.5" /> {user.credits} kredit
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Kredit & Tagihan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top up kredit sekali, pakai kapan saja — tanpa batas waktu dan tanpa
          biaya bulanan.
        </p>

        {/* Paket */}
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {PACKAGES.map((p) => (
            <div
              key={p.key}
              className={`relative flex flex-col rounded-2xl border bg-card p-5 ${
                p.highlight
                  ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
                  : "border-border"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                  Paling Populer
                </span>
              )}
              {"badge" in p && p.badge && !p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-bold text-background">
                  {p.badge}
                </span>
              )}
              <h3 className="text-base font-bold">{p.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.tagline}</p>
              <p className="mt-4 text-2xl font-extrabold">
                {formatIDR(p.price)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-primary">
                {p.credits} kredit · {p.perCredit}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-xs text-muted-foreground">
                {[
                  `${p.credits} kredit proses video`,
                  "AI potong klip otomatis",
                  "Antrian prioritas",
                  "Tidak ada batas waktu",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full rounded-full"
                variant={p.highlight ? "default" : "outline"}
                disabled={buying !== null}
                onClick={() => buy(p.key)}
              >
                {buying === p.key ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                Beli Paket
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">
          <CreditCard className="mr-1 inline h-3.5 w-3.5" />
          Mode demo: pembayaran disimulasikan langsung berhasil. Pada produksi,
          integrasikan payment gateway (Midtrans/Xendit) di{" "}
          <code className="rounded bg-muted px-1">/api/billing/topup</code>.
        </p>

        {/* Riwayat */}
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <ReceiptText className="h-4 w-4" /> Riwayat Transaksi
          </h2>
          {txs === null ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
            </div>
          ) : txs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm font-semibold">Belum ada transaksi.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Beli paket pertama Anda di atas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Kredit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txs.map((t) => {
                    const meta = TYPE_LABEL[t.type] || {
                      text: t.type,
                      cls: "bg-muted text-muted-foreground",
                    };
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {timeAgo(t.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`rounded-full ${meta.cls}`}>
                            {meta.text}
                            {t.packageName ? ` · ${t.packageName}` : ""}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-xs">
                          {t.description}
                          {t.priceIdr ? (
                            <span className="ml-1 text-muted-foreground">
                              ({formatIDR(t.priceIdr)})
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm font-bold ${
                            t.credits > 0 ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {t.credits > 0 ? "+" : ""}
                          {t.credits}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-auto border-t border-border bg-background py-6 text-center text-xs text-muted-foreground">
        © 2025 YouClip · AI Video Clipper Indonesia
      </footer>
    </div>
  );
}
