/* Utilities untuk parsing URL YouTube & mengambil metadata video (oEmbed) */

export interface YtMeta {
  youtubeId: string;
  url: string;
  title: string;
  channel: string;
  thumbnail: string;
}

/** Ekstrak video ID dari berbagai format URL YouTube */
export function extractYouTubeId(raw: string): string | null {
  if (!raw) return null;
  const url = raw.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
    /(?:youtube-nocookie\.com\/embed\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  // Raw ID (11 karakter)
  if (/^[\w-]{11}$/.test(url)) return url;
  return null;
}

function fmtDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export function formatTimestamp(sec: number): string {
  return fmtDuration(sec);
}

/** Ambil metadata publik video via YouTube oEmbed (tanpa API key) */
export async function fetchYouTubeMeta(
  youtubeId: string,
): Promise<{ ok: boolean; meta: YtMeta }> {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;
  const fallback: YtMeta = {
    youtubeId,
    url,
    title: "Video YouTube",
    channel: "YouTube",
    thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
  };
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { signal: AbortSignal.timeout(8000), cache: "no-store" },
    );
    if (!res.ok) return { ok: false, meta: fallback };
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      ok: true,
      meta: {
        youtubeId,
        url,
        title: data.title || fallback.title,
        channel: data.author_name || fallback.channel,
        thumbnail: data.thumbnail_url || fallback.thumbnail,
      },
    };
  } catch {
    return { ok: false, meta: fallback };
  }
}

/** URL embed klip dengan rentang waktu mulai-selesai */
export function clipEmbedUrl(
  youtubeId: string,
  startSec: number,
  endSec: number,
): string {
  return `https://www.youtube.com/embed/${youtubeId}?start=${Math.floor(
    startSec,
  )}&end=${Math.floor(endSec)}&rel=0&modestbranding=1`;
}
