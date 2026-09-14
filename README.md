# YouClip Clone — AI Video Clipper Platform

Aplikasi web fullstack yang mereplikasi fungsionalitas platform AI clipper: mengubah video YouTube panjang menjadi klip-klip pendek siap unggah (Shorts/TikTok/Reels) menggunakan AI. Seluruh kode, desain, dan copywriting merupakan implementasi orisinal.

## Fitur Utama

- **Landing Page** — hero, value proposition, alur kerja 3 langkah, showcase contoh klip, pricing, FAQ, halaman legal (privacy, terms, refund).
- **Autentikasi** — registrasi & login dengan password hashing (scrypt) dan session token HMAC via httpOnly cookie.
- **Dashboard Clipper** — submit link YouTube, pipeline real-time: `QUEUED → DOWNLOADING → ANALYZING → CLIPPING → COMPLETED`, dengan polling status tiap 3 detik.
- **AI Clip Generator** — menghasilkan 5 klip per video: judul kreatif, timestamp start/end, viral score, dan subtitle.
- **Sistem Kredit** — setiap proses memotong 1 kredit; refund otomatis bila pipeline gagal.
- **Billing** — 3 paket top-up dan riwayat transaksi lengkap (topup / usage / refund / bonus).

## Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API Routes |
| Database | SQLite via Prisma ORM (siap migrasi ke Postgres/Neon untuk deploy Vercel) |
| AI | z-ai-web-dev-sdk (LLM) dengan fallback heuristik |

## Struktur Proyek

```
prisma/schema.prisma        # Model: User, Video, Clip, Transaction
src/app/api/                # REST API: auth, videos, billing
src/lib/                    # auth, youtube (oEmbed), clipper pipeline
src/components/youclip/     # landing, dashboard, billing, legal, dll.
src/app/page.tsx            # SPA dengan hash routing
```

## Menjalankan Lokal

```bash
# 1. Install dependencies
bun install   # atau: npm install

# 2. Setup database
cp .env.example .env
npx prisma db push

# 3. Jalankan dev server
bun run dev   # atau: npm run dev
```

Buka http://localhost:3000 — pengguna baru mendapat kredit bonus awal untuk mencoba pipeline.

## API Ringkas

| Endpoint | Metode | Fungsi |
|---|---|---|
| `/api/auth/register` | POST | Registrasi akun baru |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Info user + kredit |
| `/api/videos` | GET/POST | Daftar & submit video |
| `/api/billing/topup` | POST | Top up kredit |
| `/api/billing/transactions` | GET | Riwayat transaksi |

## Catatan

- File `.env` dan database lokal (`db/*.db`) sengaja tidak di-commit — buat `.env` sendiri berisi `DATABASE_URL="file:./custom.db"`.
- Metadata video diambil via YouTube oEmbed publik; aplikasi tidak mendistribusikan konten berhak cipta — hanya menghasilkan rekomendasi klip (judul, timestamp, subtitle) berbasis analisis AI.
