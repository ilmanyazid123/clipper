/**
 * Unduh binary media (yt-dlp + ffmpeg static) ke ./bin untuk bundling di
 * serverless. OPT-IN: hanya jalan bila FETCH_MEDIA_BINARIES=1 — selain itu
 * keluar cepat (build tetap ringan & cepat, endpoint unduh mengembalikan
 * 501 dengan pesan jelas).
 *
 * Non-fatal: kegagalan unduhan hanya mencetak peringatan (fitur unduh
 * tinggal tidak aktif; build/deploy tetap sukses).
 *
 * Dipanggil otomatis oleh vercel.json buildCommand.
 */
import { mkdirSync, existsSync, chmodSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ENABLED = process.env.FETCH_MEDIA_BINARIES === "1";
const BIN_DIR = path.join(process.cwd(), "bin");

if (!ENABLED) {
  console.log("[fetch-media-binaries] FETCH_MEDIA_BINARIES!=1 -> lewati (fitur unduh nonaktif di runtime ini)");
  process.exit(0);
}

mkdirSync(BIN_DIR, { recursive: true });

function download(url, dest) {
  console.log(`[fetch-media-binaries] mengunduh ${url}`);
  execFileSync("curl", ["-fsSL", "--retry", "2", "-o", dest, url], { stdio: "inherit" });
}

function ensureExecutable(file) {
  if (!existsSync(file)) return false;
  chmodSync(file, 0o755);
  const mb = (statSync(file).size / 1024 / 1024).toFixed(1);
  console.log(`[fetch-media-binaries] OK ${file} (${mb} MB)`);
  return true;
}

// yt-dlp standalone linux (tanpa python)
const YTDLP = path.join(BIN_DIR, "yt-dlp");
if (!existsSync(YTDLP)) {
  try {
    download(
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux",
      YTDLP,
    );
  } catch (e) {
    console.warn(`[fetch-media-binaries] PERINGATAN: gagal unduh yt-dlp: ${e.message}`);
  }
}
ensureExecutable(YTDLP);

// ffmpeg static (johnvansickle) — tar.xz berisi ffmpeg + ffprobe
const FFMPEG = path.join(BIN_DIR, "ffmpeg");
if (!existsSync(FFMPEG)) {
  try {
    const tar = path.join(BIN_DIR, "ffmpeg.tar.xz");
    download(
      "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz",
      tar,
    );
    execFileSync("tar", ["-xJf", tar, "-C", BIN_DIR, "--strip-components=1", "ffmpeg-*-static/ffmpeg"], { shell: true, stdio: "inherit" });
    execFileSync("rm", ["-f", tar]);
  } catch (e) {
    console.warn(`[fetch-media-binaries] PERINGATAN: gagal unduh ffmpeg: ${e.message}`);
  }
}
ensureExecutable(FFMPEG);

console.log("[fetch-media-binaries] selesai.");
