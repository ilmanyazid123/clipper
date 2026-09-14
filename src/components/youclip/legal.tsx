"use client";

/* Halaman legal: Kebijakan Privasi, Ketentuan Layanan, Kebijakan Refund.
   Konten teks orisinal generik untuk kebutuhan demo produk. */

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/youclip/logo";
import { navigate } from "@/lib/client";
import { ArrowLeft } from "lucide-react";

interface Section {
  h: string;
  p: string[];
}

const PRIVACY: Section[] = [
  {
    h: "Data yang Kami Kumpulkan",
    p: [
      "Saat Anda mendaftar, kami menyimpan nama, alamat email, dan kata sandi yang telah dienkripsi. Data ini dipakai untuk mengenali akun Anda dan mengamankan akses ke dashboard.",
      "Ketika Anda memproses sebuah video, kami menyimpan tautan video YouTube yang Anda kirimkan beserta hasil pemrosesan klip (judul klip, rentang waktu, dan subtitle) di dalam akun Anda.",
    ],
  },
  {
    h: "Cara Kami Menggunakan Data",
    p: [
      "Data Anda digunakan terbatas untuk menjalankan layanan: memproses video, menampilkan riwayat klip, mengelola kredit, dan mengirimkan notifikasi status pemrosesan.",
      "Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga untuk keperluan pemasaran.",
    ],
  },
  {
    h: "Keamanan dan Penyimpanan",
    p: [
      "Kata sandi disimpan dalam bentuk hash kriptografi dan tidak pernah tersimpan sebagai teks biasa. Sesi login dijaga melalui token berumur terbatas yang tersimpan pada cookie httpOnly.",
      "Anda dapat meminta penghapusan akun beserta seluruh data yang terkait kapan saja melalui email kontak kami.",
    ],
  },
  {
    h: "Konten Pihak Ketiga",
    p: [
      "Pratinjau klip ditampilkan melalui pemutar sematan (embed) YouTube. Kebijakan data saat memutar video mengikuti kebijakan YouTube dan Google yang berlaku.",
    ],
  },
];

const TOS: Section[] = [
  {
    h: "Layanan yang Kami Sediakan",
    p: [
      "YouClip adalah alat bantu yang memakai kecerdasan buatan untuk memilih dan memotong segmen dari video YouTube yang Anda kirimkan menjadi klip pendek berformat vertikal, lengkap dengan saran subtitle.",
      "Hasil pemrosesan bersifat saran editorial. Anda tetap bertanggung jawab memeriksa dan memutuskan konten akhir yang Anda publikasikan.",
    ],
  },
  {
    h: "Akun dan Kredit",
    p: [
      "Satu akun wajib menggunakan email yang valid. Kredit yang dibeli bersifat permanen dan tidak memiliki masa kedaluwarsa. Satu kredit digunakan untuk setiap video yang berhasil masuk antrian pemrosesan.",
      "Apabila proses gagal karena kesalahan teknis di sisi kami, kredit otomatis dikembalikan ke akun Anda.",
    ],
  },
  {
    h: "Tanggung Jawab Anda sebagai Pengguna",
    p: [
      "Anda menjamin memiliki hak atas video yang dikirimkan atau memiliki izin untuk menggunakannya. Dilarang memproses konten yang melanggar hukum, hak cipta pihak lain, atau ketentuan komunitas platform tujuan (TikTok, Instagram, YouTube).",
      "Pelanggaran dapat berakibat pembekuan akun tanpa pengembalian sisa kredit.",
    ],
  },
  {
    h: "Batasan Layanan",
    p: [
      "Layanan disediakan apa adanya. Kami berupaya menjaga ketersediaan server, namun waktu pemrosesan dapat berubah tergantung antrean dan durasi video.",
      "Kami tidak bertanggung jawab atas performa konten yang Anda unggah ke platform pihak ketiga.",
    ],
  },
];

const REFUND: Section[] = [
  {
    h: "Kredit Tidak Hangus",
    p: [
      "Karena kredit bersifat permanen dan dapat dipakai kapan saja, pembelian paket secara umum tidak dapat diuangkan kembali. Namun Anda dilindungi ketentuan berikut.",
    ],
  },
  {
    h: "Refund Otomatis untuk Proses Gagal",
    p: [
      "Apabila pemrosesan video gagal karena kesalahan teknis di sisi kami, kredit yang terpakai otomatis dikembalikan penuh ke akun Anda tanpa perlu mengajukan permintaan.",
    ],
  },
  {
    h: "Permintaan Khusus",
    p: [
      "Kendala seperti pembayaran ganda atau top up tidak masuk akan kami proses dengan verifikasi bukti transaksi. Ajukan melalui email kami maksimal 14 hari sejak transaksi.",
      "Permintaan yang disetujui dapat berupa pengembalian kredit atau pengembalian dana melalui metode pembayaran asal.",
    ],
  },
];

const PAGE_META: Record<
  string,
  { title: string; updated: string; intro: string; sections: Section[] }
> = {
  privacy: {
    title: "Kebijakan Privasi",
    updated: "12 September 2025",
    intro:
      "Privasi Anda penting bagi kami. Halaman ini menjelaskan data apa yang kami kumpulkan, bagaimana data itu dipakai, dan hak-hak yang Anda miliki sebagai pengguna YouClip.",
    sections: PRIVACY,
  },
  tos: {
    title: "Ketentuan Layanan",
    updated: "12 September 2025",
    intro:
      "Dengan menggunakan YouClip, Anda menyetujui ketentuan berikut. Bacalah dengan saksama agar Anda memahami hak dan kewajiban saat memakai layanan kami.",
    sections: TOS,
  },
  refund: {
    title: "Kebijakan Pengembalian Dana",
    updated: "12 September 2025",
    intro:
      "Kami ingin Anda bertransaksi dengan tenang. Berikut kebijakan kami seputar refund dan pengembalian kredit untuk layanan YouClip.",
    sections: REFUND,
  },
};

export function LegalPage({ kind }: { kind: "privacy" | "tos" | "refund" }) {
  const page = PAGE_META[kind];
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => navigate("/")} className="cursor-pointer">
            <Logo size="sm" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight">{page.title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Terakhir diperbarui: {page.updated}
        </p>
        <p className="mt-5 leading-relaxed text-muted-foreground">{page.intro}</p>
        <Separator className="my-8" />
        <div className="space-y-9">
          {page.sections.map((s) => (
            <section key={s.h}>
              <h2 className="mb-3 text-lg font-bold">{s.h}</h2>
              <div className="space-y-3">
                {s.p.map((para, i) => (
                  <p key={i} className="leading-relaxed text-muted-foreground">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-xl border border-border bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
          Ada pertanyaan tentang halaman ini? Hubungi kami di{" "}
          <a
            href="mailto:hello@youclip-clone.id"
            className="font-semibold text-primary hover:underline"
          >
            hello@youclip-clone.id
          </a>
          .
        </p>
      </main>

      <footer className="mt-auto border-t border-border bg-background py-6 text-center text-xs text-muted-foreground">
        © 2025 YouClip · AI Video Clipper Indonesia
      </footer>
    </div>
  );
}
