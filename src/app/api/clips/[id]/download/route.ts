import { NextRequest, NextResponse } from "next/server";
import { spawn, spawnSync } from "child_process";
import { existsSync } from "fs";
import { mkdtemp, readdir, readFile, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

/* Unduh potongan video (MP4) untuk satu klip.
 *
 * Pipeline: yt-dlp mengunduh segmen video YouTube (dibantu ffmpeg untuk
 * pemotongan & merge), lalu file dikirim sebagai attachment. Route ini
 * berjalan di Node runtime (bukan Edge) karena butuh child process.
 *
 * Variabel env opsional:
 *  - YTDLP_PATH   / FFMPEG_PATH : lokasi binary jika tidak ada di PATH/cwd/bin
 *  - YTDLP_COOKIES               : isi file cookies.txt (format Netscape) untuk
 *                                  melewati bot-check YouTube dari IP server
 *  - MEDIA_DOWNLOAD_TIMEOUT_MS   : batas waktu proses (default 55.000)
 */

export const maxDuration = 60; // batas maksimum function Vercel (Hobby)

const MEDIA_TIMEOUT_MS = Number(process.env.MEDIA_DOWNLOAD_TIMEOUT_MS || 55_000);
const MAX_CLIP_SEC = 15 * 60;

function findBinary(name: string, envVar: string): string | null {
  const fromEnv = process.env[envVar];
  const candidates = [
    fromEnv || null,
    path.join(process.cwd(), "bin", name),
    "/usr/local/bin/" + name,
    "/usr/bin/" + name,
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    try {
      if (existsSync(c)) return c;
    } catch {
      /* lanjut kandidat berikutnya */
    }
  }
  try {
    const r = spawnSync("which", [name], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  } catch {
    /* which tidak tersedia */
  }
  return null;
}

function classifyError(stderr: string): { status: number; error: string } {
  const s = stderr.toLowerCase();
  if (
    s.includes("sign in to confirm") ||
    s.includes("not a bot") ||
    (s.includes("cookies") && s.includes("youtube"))
  ) {
    return {
      status: 503,
      error:
        "YouTube memblokir unduhan dari IP server ini (verifikasi bot). " +
        "Solusi: isi env YTDLP_COOKIES dengan cookies YouTube Anda (format cookies.txt), " +
        "atau jalankan aplikasi di server dengan IP residensial.",
    };
  }
  if (s.includes("video unavailable") || s.includes("private video")) {
    return { status: 404, error: "Video tidak tersedia atau bersifat privat." };
  }
  if (s.includes("429") || s.includes("too many requests")) {
    return { status: 429, error: "Terlalu banyak permintaan ke YouTube. Coba lagi beberapa saat." };
  }
  return {
    status: 500,
    error: "Gagal memotong klip di server. Detail: " + stderr.slice(-180),
  };
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const clip = await db.clip.findUnique({
    where: { id },
    include: { video: true },
  });
  if (!clip) {
    return NextResponse.json({ error: "Klip tidak ditemukan." }, { status: 404 });
  }
  if (clip.video.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (clip.video.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Video belum selesai diproses." },
      { status: 409 },
    );
  }

  const ytdlp = findBinary("yt-dlp", "YTDLP_PATH");
  const ffmpeg = findBinary("ffmpeg", "FFMPEG_PATH");
  if (!ytdlp || !ffmpeg) {
    return NextResponse.json(
      {
        error:
          "Server hosting ini belum memiliki komponen media (yt-dlp/ffmpeg). " +
          "Fitur unduh aktif di server dengan binary tersebut, atau set env " +
          "YTDLP_PATH & FFMPEG_PATH, atau aktifkan FETCH_MEDIA_BINARIES=1 saat build.",
      },
      { status: 501 },
    );
  }

  const start = Math.max(0, clip.startSec);
  const end = Math.min(Math.max(clip.endSec, start + 5), start + MAX_CLIP_SEC);

  const tmp = await mkdtemp(path.join(tmpdir(), "yc-clip-"));
  try {
    let cookiesFile: string | null = null;
    const cookies = process.env.YTDLP_COOKIES;
    if (cookies) {
      cookiesFile = path.join(tmp, "cookies.txt");
      await writeFile(cookiesFile, cookies, "utf8");
    }

    const args = [
      "-f",
      "bv*[height<=720][vcodec^=avc1]+ba[acodec^=mp4a]/b[height<=720][vcodec^=avc1]/bv*[height<=720]+ba/b[height<=720]/b",
      "--download-sections",
      `*${start}-${end}`,
      "--force-keyframes-at-cuts",
      "--merge-output-format",
      "mp4",
      "--ffmpeg-location",
      ffmpeg,
      "--no-playlist",
      "--no-progress",
      "--no-warnings",
      "--socket-timeout",
      "15",
      "--retries",
      "2",
      "-o",
      path.join(tmp, "clip.%(ext)s"),
      `https://www.youtube.com/watch?v=${clip.video.youtubeId}`,
    ];
    if (cookiesFile) args.push("--cookies", cookiesFile);

    const proc = spawn(ytdlp, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
      if (stderr.length > 8000) stderr = stderr.slice(-8000);
    });
    const timer = setTimeout(() => {
      try {
        proc.kill("SIGKILL");
      } catch {
        /* proses sudah mati */
      }
    }, MEDIA_TIMEOUT_MS);
    const code: number = await new Promise((resolve) => {
      proc.on("close", (c) => resolve(c ?? 1));
      proc.on("error", () => resolve(1));
    });
    clearTimeout(timer);

    if (code !== 0) {
      const cls = classifyError(stderr);
      return NextResponse.json(cls, { status: cls.status });
    }

    const files = (await readdir(tmp)).filter(
      (f) => f.startsWith("clip.") && !f.endsWith(".txt"),
    );
    if (files.length === 0) {
      return NextResponse.json(
        { error: "Berkas klip tidak ditemukan setelah diproses." },
        { status: 500 },
      );
    }
    const buf = await readFile(path.join(tmp, files[0]));
    const safeName =
      (clip.title || "klip")
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
        .toLowerCase() || "klip";
    const filename = `youclip-${safeName}-${start}s-${end}s.mp4`;

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(buf.byteLength),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } finally {
    rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}
