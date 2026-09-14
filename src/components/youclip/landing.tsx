"use client";

/* Landing page YouClip: hero, value props, cara kerja, showcase,
   founder, harga, FAQ, footer. */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Scissors,
  Sparkles,
  Zap,
  Clock,
  CreditCard,
  ClipboardPaste,
  Wand2,
  Download,
  Play,
  ShieldCheck,
  Check,
  Mail,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Logo } from "@/components/youclip/logo";
import { navigate, useAuth } from "@/lib/client";
import type { SampleClip } from "@/components/youclip/samples";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ================= Navbar ================= */

export function LandingNav() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => navigate("/")}
          aria-label="Beranda YouClip"
          className="cursor-pointer"
        >
          <Logo />
        </button>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <button onClick={() => scrollToId("fitur")} className="hover:text-foreground transition-colors cursor-pointer">
            Fitur Utama
          </button>
          <button onClick={() => scrollToId("cara-kerja")} className="hover:text-foreground transition-colors cursor-pointer">
            Cara Kerja
          </button>
          <button onClick={() => scrollToId("harga")} className="hover:text-foreground transition-colors cursor-pointer">
            Harga
          </button>
          <button onClick={() => scrollToId("faq")} className="hover:text-foreground transition-colors cursor-pointer">
            FAQ
          </button>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button onClick={() => navigate("/dashboard")} className="rounded-full">
              Ke Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/auth/signin")}
                className="rounded-full hidden sm:inline-flex"
              >
                Masuk
              </Button>
              <Button onClick={() => navigate("/auth/signup")} className="rounded-full">
                Mulai Sekarang
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ================= Hero ================= */

function Hero() {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(79,70,229,0.10),transparent_70%)]"
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 text-center">
        <Badge
          variant="secondary"
          className="mx-auto mb-6 gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Video Clipper #1 untuk Kreator Indonesia
        </Badge>
        <h1 className="mx-auto max-w-4xl text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Ubah Video YouTube Panjang Jadi{" "}
          <span className="font-display italic text-primary">Shorts Viral</span>{" "}
          Otomatis
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tempel link YouTube. AI kami memilih momen terbaik, memotongnya ke
          format vertikal, lalu menambahkan subtitle otomatis — semuanya dalam
          hitungan menit.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => navigate(user ? "/dashboard" : "/auth/signup")}
            className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/25"
          >
            Coba Sekarang Gratis
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Tanpa kartu kredit. Gratis 1 kredit percobaan.
        </p>

        {/* Mock preview */}
        <div className="relative mx-auto mt-14 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-1.5 px-2 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 hidden rounded-md bg-muted px-3 py-1 text-[11px] text-muted-foreground sm:block">
                app.youclip-clone.id/dashboard
              </span>
            </div>
            <div className="grid gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-[1fr_auto_auto_auto]">
              <div className="rounded-lg border border-dashed border-primary/40 bg-background px-4 py-3 text-left text-sm text-muted-foreground">
                https://youtube.com/watch?v=...
              </div>
              <Button className="rounded-lg">Proses Video</Button>
              <div className="hidden items-center rounded-lg bg-background px-3 text-xs font-medium text-muted-foreground sm:flex">
                1 kredit
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[88, 92, 76, 95, 84].map((score, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-lg border border-border bg-background p-2"
                >
                  <div className="flex aspect-[9/14] items-center justify-center rounded-md bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between px-0.5 pb-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Klip {i + 1}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary">
                      <Flame className="h-3 w-3" />
                      {score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= Value props ================= */

function ValueProps() {
  const items = [
    {
      icon: Zap,
      title: "Fokus Bikin Konten, Bukan Mengedit",
      desc: "Rekam percakapan terbaik Anda, lalu serahkan sisanya. AI memilih momen emas dan menyiapkan klip pendek secara otomatis, tanpa Anda menyentuh timeline editing.",
    },
    {
      icon: Scissors,
      title: "Satu Video = 5 Klip Siap Tayang",
      desc: "Setiap video panjang menyimpan banyak potensi. Kami mengekstrak 5 momen terbaiknya menjadi konten Shorts, Reels, dan TikTok yang langsung siap diunggah.",
    },
    {
      icon: CreditCard,
      title: "Bayar Sekali, Pakai Selamanya",
      desc: "Dapatkan hasil berkualitas konsisten tanpa memelihara tim produksi. Top up kredit sesuai kebutuhan — tanpa langganan bulanan dan tanpa biaya tersembunyi.",
    },
  ];
  return (
    <section id="fitur" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          Anda Sudah Punya Kontennya.{" "}
          <span className="font-display italic text-primary">
            Kami Bantu Menyebarkannya.
          </span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Setiap video panjang Anda adalah tambang emas. YouClip menemukan dan
          memotongnya — tanpa Anda harus duduk berjam-jam di meja editing.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
          >
            <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <item.icon className="h-5 w-5" />
            </span>
            <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= Cara kerja ================= */

function HowItWorks() {
  const steps = [
    {
      icon: ClipboardPaste,
      num: "1",
      title: "Tempel Link YouTube",
      desc: "Salin link video podcast, webinar, atau materi edukasi dari YouTube, lalu tempelkan di dashboard YouClip.",
    },
    {
      icon: Wand2,
      num: "2",
      title: "AI Bekerja Otomatis",
      desc: "Tinggal ngopi. AI menganalisis transkrip, memotong momen emas, dan menyusun subtitle secara otomatis.",
    },
    {
      icon: Download,
      num: "3",
      title: "Download & Upload",
      desc: "Pilih klip favorit Anda, unduh, dan langsung posting ke TikTok, Reels, atau Shorts.",
    },
  ];
  return (
    <section id="cara-kerja" className="border-y border-border bg-muted/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cuma 3 Langkah.{" "}
            <span className="font-display italic text-primary">
              Semudah Copy-Paste.
            </span>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute left-[calc(50%+40px)] top-10 hidden h-px w-[calc(100%-80px)] border-t-2 border-dashed border-primary/25 md:block"
                />
              )}
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="relative mx-auto mb-5 inline-flex">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                    {s.num}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= Showcase ================= */

function Showcase() {
  const [playing, setPlaying] = useState<SampleClip | null>(null);
  const doubled = [...SAMPLES, ...SAMPLES];
  return (
    <section className="mx-auto max-w-6xl overflow-hidden px-4 py-20 sm:px-6">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          Lihat{" "}
          <span className="font-display italic text-primary">Hasil Akhirnya</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Contoh klip yang dihasilkan — putar untuk melihat detailnya.
        </p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max gap-4 yc-marquee">
          {doubled.map((clip, i) => (
            <button
              key={`${clip.title}-${i}`}
              onClick={() => setPlaying(clip)}
              className="group w-44 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
            >
              <div className="relative flex aspect-[9/14] items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-foreground/5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-transform group-hover:scale-110">
                  <Play className="h-5 w-5 fill-current" />
                </span>
                <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {clip.duration}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 min-h-[2.4rem] text-xs font-semibold leading-snug">
                  {clip.title}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-primary">
                  <Flame className="h-3 w-3" /> Skor viral {clip.score}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="pr-6 text-base">{playing?.title}</DialogTitle>
            <DialogDescription>
              Pratinjau klip vertikal dengan subtitle otomatis.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl border border-border">
            {playing && (
              <iframe
                title={playing.title}
                className="aspect-[9/14] w-full"
                src={playing.embedUrl}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { SAMPLES } from "@/components/youclip/samples";

/* ================= Founder ================= */

function Founder() {
  return (
    <section className="border-y border-border bg-muted/50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-primary to-primary/60 text-5xl font-extrabold text-primary-foreground shadow-xl shadow-primary/20">
            S
          </div>
        </div>
        <div className="max-w-2xl">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
            Halo, saya{" "}
            <span className="font-display italic text-primary">Surya</span>
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Saya membangun YouClip dengan satu keyakinan: kreator hebat
            seharusnya fokus berkarya dan berbicara — bukan membuang waktu untuk
            pekerjaan teknis editing yang berulang dan melelahkan.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Tujuan saya sederhana: YouClip harus benar-benar menyelesaikan
            masalah Anda. Punya ide fitur atau menemukan kendala? Kirim email
            atau chat saya langsung. Masukan Anda adalah roadmap kami.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="mailto:hello@youclip-clone.id"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Mail className="h-4 w-4" /> hello@youclip-clone.id
            </a>
            <span className="text-sm text-muted-foreground">
              — Surya Elidanto · Founder YouClip
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= Pricing ================= */

export const PACKAGES = [
  {
    key: "starter",
    name: "Starter",
    tagline: "Untuk pemula yang ingin mencoba",
    price: 25000,
    credits: 10,
    perCredit: "Rp2.500/kredit",
    highlight: false,
  },
  {
    key: "creator",
    name: "Creator",
    tagline: "Pilihan populer untuk konten rutin",
    price: 50000,
    credits: 22,
    perCredit: "Rp2.273/kredit",
    highlight: true,
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Value terbaik untuk produksi maksimal",
    price: 99000,
    credits: 60,
    perCredit: "Rp1.650/kredit",
    highlight: false,
    badge: "Best Value",
  },
] as const;

function Pricing() {
  const { user } = useAuth();
  return (
    <section id="harga" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          Pilih Paket Kredit{" "}
          <span className="font-display italic text-primary">
            Sesuai Kebutuhan
          </span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Top up kredit sekali, pakai kapan saja. Akun yang sudah top up juga
          mendapat antrian prioritas saat server sibuk.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {PACKAGES.map((p) => (
          <div
            key={p.key}
            className={`relative flex flex-col rounded-2xl border bg-card p-6 ${
              p.highlight
                ? "border-primary shadow-xl shadow-primary/10 ring-1 ring-primary"
                : "border-border"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                Paling Populer
              </span>
            )}
            {!p.highlight && "badge" in p && p.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-bold text-background">
                {p.badge}
              </span>
            )}
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
            <div className="mt-5">
              <span className="text-3xl font-extrabold tracking-tight">
                Rp{p.price.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-primary">
              {p.credits} kredit · {p.perCredit}
            </p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {[
                `${p.credits} kredit proses video`,
                "AI potong klip otomatis",
                "Antrian prioritas saat server ramai",
                "Tidak ada batas waktu",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full rounded-full"
              variant={p.highlight ? "default" : "outline"}
              onClick={() => navigate(user ? "/billing" : "/auth/signup")}
            >
              Beli Paket
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <button
          onClick={() => navigate("/billing")}
          className="font-semibold text-primary hover:underline cursor-pointer"
        >
          Top up langsung di dashboard
        </button>
      </p>
    </section>
  );
}

/* ================= FAQ ================= */

const FAQS = [
  {
    q: "Apakah kredit bisa hangus atau expired?",
    a: "Tidak bisa. Kredit yang sudah Anda beli bersifat permanen dan berlaku seumur hidup, jadi bisa dipakai kapan pun Anda membutuhkannya tanpa tekanan waktu.",
  },
  {
    q: "Berapa lama proses pembuatan klip?",
    a: "Rata-rata 5–30 menit tergantung durasi video asli. Begitu klip selesai diproses, Anda akan menerima notifikasi email dan hasilnya langsung bisa diunduh dari dashboard.",
  },
  {
    q: "Video seperti apa yang paling cocok untuk YouClip?",
    a: "Video berbentuk podcast, webinar, tutorial, atau konten berbicara (talking head) memberikan hasil terbaik. Sebaliknya, video yang didominasi musik atau minim dialog cenderung kurang optimal karena AI bekerja berdasarkan transkrip percakapan.",
  },
  {
    q: "Apakah ada biaya bulanan atau langganan?",
    a: "Tidak ada. Sistem kami pay-as-you-go: Anda cukup membeli kredit sesuai kebutuhan tanpa langganan bulanan maupun biaya tersembunyi.",
  },
  {
    q: "Bisakah saya mengusulkan fitur baru?",
    a: "Sangat kami nantikan. Feedback dan permintaan fitur dari pengguna adalah bagian utama dari roadmap kami — hubungi kami lewat email kapan saja.",
  },
  {
    q: "Bagaimana jika hasil klipnya tidak sesuai harapan?",
    a: "Kami terus memperbarui algoritma AI kami. Jika proses gagal karena masalah teknis di sisi kami, kredit Anda otomatis dikembalikan ke akun tanpa perlu mengajukan permintaan.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pertanyaan yang{" "}
            <span className="font-display italic text-primary">
              Sering Ditanyakan
            </span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Masih ada pertanyaan lain? Hubungi kami via email di{" "}
          <a
            href="mailto:hello@youclip-clone.id"
            className="font-semibold text-primary hover:underline"
          >
            hello@youclip-clone.id
          </a>
        </p>
      </div>
    </section>
  );
}

/* ================= Footer ================= */

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              AI video clipper Indonesia yang membantu kreator mengubah video
              YouTube panjang menjadi klip viral untuk TikTok, Reels, dan
              Shorts.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold">Produk</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <button onClick={() => scrollToId("fitur")} className="hover:text-foreground cursor-pointer">
                  Fitur Utama
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("cara-kerja")} className="hover:text-foreground cursor-pointer">
                  Cara Kerja
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("harga")} className="hover:text-foreground cursor-pointer">
                  Harga
                </button>
              </li>
              <li>
                <button onClick={() => scrollToId("faq")} className="hover:text-foreground cursor-pointer">
                  FAQ
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/privacy")} className="hover:text-foreground cursor-pointer">
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/tos")} className="hover:text-foreground cursor-pointer">
                  Ketentuan Layanan
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/refund")} className="hover:text-foreground cursor-pointer">
                  Kebijakan Pengembalian Dana
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© 2025 YouClip. Semua hak dilindungi.</span>
          <span className="inline-flex items-center gap-1">
            Dibuat dengan <span aria-hidden>❤</span> di Indonesia
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ================= Page ================= */

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <ValueProps />
        <HowItWorks />
        <Showcase />
        <Founder />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
