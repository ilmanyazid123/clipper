"use client";

/* Halaman autentikasi: masuk & daftar. */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/youclip/logo";
import { api, navigate, useAuth } from "@/lib/client";
import { Loader2, ArrowLeft, Sparkles, Scissors, Flame } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AuthPage({ mode }: { mode: "signin" | "signup" }) {
  const isSignup = mode === "signup";
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api<{ user: { id: string; name: string; email: string; credits: number } }>(
        isSignup ? "/api/auth/register" : "/api/auth/login",
        { method: "POST", body: isSignup ? { name, email, password } : { email, password } },
      );
      setUser(data.user);
      toast({
        title: isSignup ? "Akun berhasil dibuat!" : "Selamat datang kembali!",
        description: isSignup
          ? "Anda mendapat 1 kredit gratis untuk mencoba."
          : "Lanjutkan memproses video Anda.",
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          <Logo size="sm" />
        </button>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5 md:grid md:grid-cols-2">
          {/* Form */}
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isSignup ? "Buat akun gratis" : "Masuk ke akun Anda"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignup
                ? "Daftar dan langsung dapat 1 kredit percobaan — tanpa kartu kredit."
                : "Selamat datang kembali! Masuk untuk melanjutkan."}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="cth. Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignup ? "Minimal 6 karakter" : "Password Anda"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignup ? "Daftar Sekarang" : "Masuk"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">atau</span>
              <Separator className="flex-1" />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <button
                onClick={() => navigate(isSignup ? "/auth/signin" : "/auth/signup")}
                className="font-semibold text-primary hover:underline cursor-pointer"
              >
                {isSignup ? "Masuk di sini" : "Daftar gratis"}
              </button>
            </p>
          </div>

          {/* Panel kanan */}
          <div className="hidden flex-col justify-center gap-6 bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-10 text-primary-foreground md:flex">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/15">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="text-lg font-bold">Kenapa YouClip?</p>
            </div>
            <ul className="space-y-5 text-sm leading-relaxed">
              <li className="flex gap-3">
                <Scissors className="mt-0.5 h-5 w-5 shrink-0 opacity-90" />
                <span>
                  <b>Satu video, lima klip.</b> AI memilih momen terbaik dari
                  video panjang Anda secara otomatis.
                </span>
              </li>
              <li className="flex gap-3">
                <Flame className="mt-0.5 h-5 w-5 shrink-0 opacity-90" />
                <span>
                  <b>Siap menembus FYP.</b> Format vertikal dengan subtitle
                  otomatis bergaya media sosial.
                </span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 opacity-90" />
                <span>
                  <b>Hemat 90% waktu editing.</b> Tidak perlu berjam-jam di
                  timeline — tempel link, tunggu, unduh.
                </span>
              </li>
            </ul>
            <p className="rounded-xl bg-background/10 p-4 text-xs leading-relaxed opacity-90">
              “Dulu satu video butuh seharian buat dipotong. Sekarang sambil
              ngopi klipnya sudah siap upload.”
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
