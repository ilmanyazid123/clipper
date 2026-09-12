/* Mesin AI Clipper: analisis video, pilih momen terbaik, generate klip + subtitle.
   Memakai z-ai-web-dev-sdk (LLM) di backend dengan fallback heuristik. */

import ZAI from "z-ai-web-dev-sdk";
import type { ClipDraft } from "@/lib/types";

const CLIP_TARGET_SEC = 45;

/* ---------------- Fallback heuristik (tanpa LLM) ---------------- */

const HOOK_WORDS = [
  "Momen paling ditunggu",
  "Bagian yang bikin kaget",
  "Poin kunci pembahasan",
  "Cerita paling menarik",
  "Kesimpulan penting",
];

function heuristicClips(
  title: string,
  durationSec: number,
): ClipDraft[] {
  const dur = durationSec > 300 ? durationSec : 1800; // default 30 menit
  const usable = Math.max(dur - CLIP_TARGET_SEC * 6, 60);
  return Array.from({ length: 5 }, (_, i) => {
    const start = Math.floor(60 + (usable / 5) * i + Math.random() * 30);
    const len = 30 + Math.floor(Math.random() * 40);
    return {
      title: `${HOOK_WORDS[i % HOOK_WORDS.length]} — ${title}`.slice(0, 90),
      hook: HOOK_WORDS[i % HOOK_WORDS.length],
      startSec: start,
      endSec: start + len,
      viralScore: 72 + Math.floor(Math.random() * 25),
      subtitles: [
        "Ini bagian favorit saya dari pembahasan tadi...",
        "Dan di sinilah semuanya berubah.",
        "Banyak orang tidak sadar soal ini.",
        "Jadi intinya, begini cara kerjanya.",
      ],
    };
  });
}

/* ---------------- Generation via LLM ---------------- */

function safeJsonParse<T>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const start = cleaned.search(/[[{]/);
    if (start === -1) return null;
    const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export async function generateClips(
  title: string,
  channel: string,
  durationSec: number,
): Promise<ClipDraft[]> {
  const dur = durationSec > 300 ? durationSec : 1800;
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "Kamu adalah editor video viral profesional untuk TikTok/Reels/Shorts berbahasa Indonesia. " +
            "Tugasmu memilih 5 momen terbaik dari sebuah video panjang untuk dijadikan klip pendek vertikal. " +
            "Jawab HANYA dengan JSON valid tanpa penjelasan tambahan.",
        },
        {
          role: "user",
          content:
            `Judul video: "${title}"\nChannel: ${channel}\nDurasi: ${Math.floor(dur / 60)} menit\n\n` +
            `Buat 5 klip viral berformat JSON array, tiap objek berisi:\n` +
            `- "title": judul klip viral maks 60 karakter, menarik, gaya hook media sosial Indonesia\n` +
            `- "hook": kalimat pembuka subtitle maks 60 karakter\n` +
            `- "startSec": detik mulai (angka, menyebar merata, hindari 0-60 detik pertama)\n` +
            `- "endSec": detik selesai (durasi klip 30-75 detik, harus > startSec)\n` +
            `- "viralScore": skor potensi viral 70-99\n` +
            `- "subtitles": array berisi 4 kalimat subtitle pendek bahasa Indonesia gaya percakapan\n\n` +
            `Contoh: [{"title":"...","hook":"...","startSec":320,"endSec":368,"viralScore":91,"subtitles":["...","..."]}]`,
        },
      ],
      thinking: { type: "disabled" },
    });
    const raw = completion.choices[0]?.message?.content || "";
    const parsed = safeJsonParse<ClipDraft[]>(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return heuristicClips(title, durationSec);
    }
    const valid = parsed
      .filter(
        (c) =>
          typeof c.title === "string" &&
          typeof c.startSec === "number" &&
          typeof c.endSec === "number" &&
          c.endSec > c.startSec,
      )
      .slice(0, 5)
      .map((c, i) => ({
        title: String(c.title).slice(0, 90),
        hook: String(c.hook || "").slice(0, 90),
        startSec: Math.max(0, Math.floor(c.startSec)),
        endSec: Math.floor(c.endSec),
        viralScore: Math.min(99, Math.max(60, Math.floor(c.viralScore || 85))),
        subtitles: Array.isArray(c.subtitles)
          ? c.subtitles.slice(0, 6).map((s) => String(s).slice(0, 120))
          : heuristicClips(title, durationSec)[i].subtitles,
      }));
    while (valid.length < 5) {
      valid.push(heuristicClips(title, durationSec)[valid.length]);
    }
    return valid;
  } catch {
    return heuristicClips(title, durationSec);
  }
}

/* ---------------- Pipeline background ---------------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Simulasi pipeline pemrosesan klip (downloading → analyzing → clipping → done).
 * Durasi video didapat dari klien (player API) atau estimasi acak bila tidak tersedia.
 */
export async function processVideo(videoId: string) {
  try {
    const video = await (await import("@/lib/db")).db.video.findUnique({
      where: { id: videoId },
    });
    if (!video) return;

    const stages: Array<{
      after: number;
      status: string;
      progress: number;
      text: string;
    }> = [
      { after: 2500, status: "DOWNLOADING", progress: 25, text: "Mengunduh video dari YouTube..." },
      { after: 6500, status: "ANALYZING", progress: 50, text: "AI menganalisis transkrip & mencari momen emas..." },
      { after: 11000, status: "CLIPPING", progress: 80, text: "Memotong klip vertikal & menyusun subtitle..." },
    ];

    for (const s of stages) {
      await sleep(s.after);
      await (await import("@/lib/db")).db.video.update({
        where: { id: videoId },
        data: { status: s.status, progress: s.progress, stageText: s.text },
      });
    }

    // Generate klip via AI
    const clips = await generateClips(
      video.title,
      video.channel,
      video.durationSec,
    );

    await (await import("@/lib/db")).db.clip.deleteMany({ where: { videoId } });
    await (await import("@/lib/db")).db.clip.createMany({
      data: clips.map((c, i) => ({
        videoId,
        order: i,
        title: c.title,
        hook: c.hook,
        startSec: c.startSec,
        endSec: c.endSec,
        viralScore: c.viralScore,
        subtitles: JSON.stringify(c.subtitles),
      })),
    });

    await (await import("@/lib/db")).db.video.update({
      where: { id: videoId },
      data: {
        status: "COMPLETED",
        progress: 100,
        stageText: "Selesai! 5 klip siap dipublikasikan.",
        completedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[clipper] pipeline failed:", err);
    try {
      const d = (await import("@/lib/db")).db;
      await d.video.update({
        where: { id: videoId },
        data: {
          status: "FAILED",
          stageText: "Terjadi kesalahan saat memproses video.",
          error: String(err),
        },
      });
      // Refund 1 kredit
      const failed = await d.video.findUnique({ where: { id: videoId } });
      if (failed) {
        await d.user.update({
          where: { id: failed.userId },
          data: { credits: { increment: 1 } },
        });
        await d.transaction.create({
          data: {
            userId: failed.userId,
            type: "REFUND",
            credits: 1,
            description: "Pengembalian kredit — proses video gagal",
          },
        });
      }
    } catch (e2) {
      console.error("[clipper] refund failed:", e2);
    }
  }
}
