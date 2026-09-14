import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { extractYouTubeId, fetchYouTubeMeta } from "@/lib/youtube";
import { processVideo } from "@/lib/clipper";
import type { VideoDTO } from "@/lib/types";
import type { Video, Clip } from "@prisma/client";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const videos = await db.video.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { clips: { orderBy: { order: "asc" } } },
  });
  const data: VideoDTO[] = videos.map((v: Video & { clips: Clip[] }) => ({
    id: v.id,
    youtubeId: v.youtubeId,
    url: v.url,
    title: v.title,
    channel: v.channel,
    thumbnail: v.thumbnail,
    durationSec: v.durationSec,
    status: v.status,
    progress: v.progress,
    stageText: v.stageText,
    createdAt: v.createdAt.toISOString(),
    clips: v.clips.map((c) => ({
      id: c.id,
      order: c.order,
      title: c.title,
      hook: c.hook,
      startSec: c.startSec,
      endSec: c.endSec,
      viralScore: c.viralScore,
      subtitles: JSON.parse(c.subtitles || "[]") as string[],
    })),
  }));
  return NextResponse.json({ videos: data, credits: user.credits });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawUrl = String(body.url || "").trim();
    const durationSec = Math.max(
      0,
      Math.min(6 * 3600, Math.floor(Number(body.durationSec) || 0)),
    );

    const youtubeId = extractYouTubeId(rawUrl);
    if (!youtubeId) {
      return NextResponse.json(
        { error: "Link YouTube tidak valid. Gunakan format youtube.com/watch?v=... atau youtu.be/..." },
        { status: 400 },
      );
    }

    // Cegah duplikat yang masih diproses / sudah selesai
    const dup = await db.video.findFirst({
      where: { userId: user.id, youtubeId, status: { in: ["QUEUED", "DOWNLOADING", "ANALYZING", "CLIPPING"] } },
    });
    if (dup) {
      return NextResponse.json(
        { error: "Video ini sedang diproses. Tunggu hingga selesai." },
        { status: 409 },
      );
    }

    // Cek & potong kredit secara atomik
    const updated = await db.user.updateMany({
      where: { id: user.id, credits: { gte: 1 } },
      data: { credits: { decrement: 1 } },
    });
    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Kredit Anda habis. Silakan top up terlebih dahulu." },
        { status: 402 },
      );
    }

    const { ok, meta } = await fetchYouTubeMeta(youtubeId);
    if (!ok) {
      // Video tidak ditemukan → kembalikan kredit
      await db.user.update({ where: { id: user.id }, data: { credits: { increment: 1 } } });
      return NextResponse.json(
        { error: "Video tidak dapat diakses. Pastikan video publik (bukan private/age-restricted)." },
        { status: 400 },
      );
    }

    const existingDone = await db.video.findFirst({
      where: { userId: user.id, youtubeId, status: "COMPLETED" },
    });
    if (existingDone) {
      await db.user.update({ where: { id: user.id }, data: { credits: { increment: 1 } } });
      return NextResponse.json(
        { error: "Video ini sudah pernah diproses. Lihat hasilnya di riwayat.", duplicateId: existingDone.id },
        { status: 409 },
      );
    }

    const video = await db.video.create({
      data: {
        userId: user.id,
        youtubeId: meta.youtubeId,
        url: meta.url,
        title: meta.title,
        channel: meta.channel,
        thumbnail: meta.thumbnail,
        durationSec,
        status: "QUEUED",
        progress: 10,
        stageText: "Masuk antrian pemrosesan...",
      },
    });

    await db.transaction.create({
      data: {
        userId: user.id,
        type: "USAGE",
        credits: -1,
        description: `Proses video: ${meta.title.slice(0, 70)}`,
      },
    });

    // Jalankan pipeline di background (tidak menahan respons)
    void processVideo(video.id);

    const fresh = await db.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    return NextResponse.json({ videoId: video.id, credits: fresh?.credits ?? 0 });
  } catch (err) {
    console.error("[videos POST]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 },
    );
  }
}
