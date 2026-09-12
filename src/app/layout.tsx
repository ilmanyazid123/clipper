import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "YouClip - Ubah Video YouTube Jadi Klip Viral Otomatis",
  description:
    "Potong video YouTube jadi 5 klip viral otomatis untuk TikTok, Instagram Reels, dan YouTube Shorts. Hemat waktu editing 90% dengan AI subtitle Indonesia. Coba gratis!",
  keywords: [
    "AI video clipper",
    "potong video YouTube",
    "klip viral",
    "TikTok",
    "Instagram Reels",
    "YouTube Shorts",
    "subtitle otomatis",
  ],
  openGraph: {
    title: "YouClip - Ubah Video YouTube Jadi Klip Viral Otomatis",
    description:
      "Tempel link YouTube. AI kami memilih momen terbaik, memotong vertikal, dan menambahkan subtitle otomatis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Font global via root layout (App Router) — berlaku untuk semua halaman */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
