"use client";

/* Dashboard: submit link YouTube, daftar video + status pipeline,
   galeri klip dengan player embed & subtitle. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/youclip/logo";
import {
  api,
  formatDuration,
  formatTs,
  navigate,
  timeAgo,
  useAuth,
} from "@/lib/client";
import type { VideoDTO } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  LogOut,
  Coins,
  Link2,
  Play,
  RefreshCw,
  History,
  CreditCard,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Copy,
  Home,
  FileText,
  Scissors,
  Download,
} from "lucide-react";

const PROCESSING_STATUSES = ["QUEUED", "DOWNLOADING", "ANALYZING", "CLIPPING"];

function statusLabel(v: VideoDTO): string {
  return v.stageText || v.status;
}

function slugify(text: string): string {
  return (
    text
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .toLowerCase() || "klip"
  );
}

/* ================= Unduh klip (MP4) ================= */

function useClipDownload() {
  const [busyId, setBusyId] = useState<string | null>(null);

  const download = useCallback(
    async (clip: VideoDTO["clips"][number], video: VideoDTO, index: number) => {
      if (busyId) return;
      setBusyId(clip.id);
      try {
        const res = await fetch(`/api/clips/${clip.id}/download`);
        const ct = res.headers.get("content-type") || "";
        if (!res.ok || (!ct.includes("video") && !ct.includes("octet-stream"))) {
          let msg = "Gagal mengunduh klip.";
          try {
            const j = await res.json();
            if (j?.error) msg = j.error;
          } catch {
            /* respons bukan JSON */
          }
          throw new Error(msg);
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `youclip-${slugify(video.title)}-klip-${index + 1}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
        toast({
          title: "Klip terunduh!",
          description: `“${clip.title.slice(0, 60)}” tersimpan sebagai ${a.download}`,
        });
      } catch (err) {
        toast({
          title: "Unduhan gagal",
          description:
            err instanceof Error ? err.message : "Coba lagi beberapa saat.",
          variant: "destructive",
        });
      } finally {
        setBusyId(null);
      }
    },
    [busyId],
  );

  return { busyId, download };
}

/* ================= Navbar aplikasi ================= */

function AppNav() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button onClick={() => navigate("/dashboard")} className="cursor-pointer">
          <Logo />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary sm:inline-flex">
            <Coins className="h-3.5 w-3.5" />
            {user?.credits ?? 0} kredit
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => navigate("/billing")}
          >
            <CreditCard className="mr-1 h-4 w-4" />
            Top Up
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Menu akun"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground cursor-pointer"
              >
                {(user?.name || "A").charAt(0).toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <Home className="mr-2 h-4 w-4" /> Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/billing")}>
                <Coins className="mr-2 h-4 w-4" /> Kredit & Tagihan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/* ================= Form submit ================= */

function SubmitForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { user, refresh } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      // Ambil durasi video (opsional, via oEmbed page timing tidak tersedia → kirim 0)
      await api("/api/videos", {
        method: "POST",
        body: { url: url.trim(), durationSec: 0 },
      });
      setUrl("");
      await refresh();
      toast({
        title: "Video masuk antrian!",
        description: "AI sedang memproses. Pantau statusnya di bawah.",
      });
      onSubmitted();
    } catch (err) {
      toast({
        title: "Gagal memproses",
        description: err instanceof Error ? err.message : "Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Tempel link YouTube di sini... (youtube.com/watch?v=... atau youtu.be/...)"
            className="h-12 rounded-xl pl-10"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-xl px-6 font-semibold"
          disabled={loading || !url.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <Scissors className="mr-2 h-4 w-4" /> Potong Klip (1 kredit)
            </>
          )}
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          1 kredit = 1 video = 5 klip siap tayang. Kredit tidak pernah hangus.
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          <Coins className="h-3.5 w-3.5" /> Sisa kredit: {user?.credits ?? 0}
        </span>
      </div>
    </div>
  );
}

/* ================= Kartu video ================= */

function VideoCard({
  video,
  onOpen,
}: {
  video: VideoDTO;
  onOpen: (v: VideoDTO) => void;
}) {
  const processing = PROCESSING_STATUSES.includes(video.status);
  const failed = video.status === "FAILED";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="flex gap-4 p-4">
        <div className="relative hidden w-40 shrink-0 overflow-hidden rounded-xl sm:block">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-24 w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-bold sm:text-base">
              {video.title}
            </h3>
            {video.status === "COMPLETED" && (
              <Badge className="shrink-0 gap-1 rounded-full bg-primary/10 text-primary" variant="secondary">
                <CheckCircle2 className="h-3 w-3" /> Selesai
              </Badge>
            )}
            {failed && (
              <Badge className="shrink-0 gap-1 rounded-full bg-destructive/10 text-destructive" variant="secondary">
                <AlertCircle className="h-3 w-3" /> Gagal
              </Badge>
            )}
            {processing && (
              <Badge className="shrink-0 gap-1 rounded-full bg-amber-500/10 text-amber-600" variant="secondary">
                <Loader2 className="h-3 w-3 animate-spin" /> Diproses
              </Badge>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">{video.channel}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {timeAgo(video.createdAt)}
            </span>
            {video.durationSec > 0 && <span>{formatDuration(video.durationSec)}</span>}
          </p>

          {processing && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  {statusLabel(video)}
                </span>
                <span className="font-bold text-primary">{video.progress}%</span>
              </div>
              <Progress value={video.progress} className="h-1.5" />
            </div>
          )}

          {failed && (
            <p className="mt-2 line-clamp-1 text-xs text-destructive">
              {statusLabel(video)} Kredit sudah dikembalikan.
            </p>
          )}

          {video.status === "COMPLETED" && (
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" className="rounded-full" onClick={() => onOpen(video)}>
                <Play className="mr-1 h-3.5 w-3.5" />
                Lihat {video.clips.length} Klip
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  navigator.clipboard.writeText(video.url).then(() =>
                    toast({ title: "Link video disalin." }),
                  );
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= Dialog detail video + klip ================= */

function ClipCard({
  video,
  index,
  onPlay,
  downloading,
  onDownload,
}: {
  video: VideoDTO;
  index: number;
  onPlay: () => void;
  downloading: boolean;
  onDownload: () => void;
}) {
  const clip = video.clips[index];
  if (!clip) return null;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay();
        }
      }}
      className="group w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative flex aspect-[9/13] items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
          <Play className="h-5 w-5 fill-current" />
        </span>
        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {formatTs(clip.startSec)} – {formatTs(clip.endSec)}
        </span>
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
          <Flame className="h-3 w-3 text-orange-400" /> {clip.viralScore}
        </span>
        <button
          type="button"
          aria-label={`Unduh klip ${index + 1}`}
          title="Unduh video klip (MP4)"
          disabled={downloading}
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="absolute bottom-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-xs font-bold leading-snug">
          {clip.title}
        </p>
        <p className="mt-1.5 line-clamp-1 text-[11px] text-muted-foreground">
          “{clip.hook || clip.subtitles[0] || "..."}”
        </p>
      </div>
    </div>
  );
}

function VideoDetailInner({
  video,
  onBack,
}: {
  video: VideoDTO;
  onBack: () => void;
}) {
  const [active, setActive] = useState(0);
  const { busyId, download } = useClipDownload();
  const clip = video.clips[active];

  return (
    <>
      <DialogHeader>
        <button
          onClick={onBack}
          className="absolute left-4 top-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-label="Kembali"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali
        </button>
        <DialogTitle className="pl-14 pr-8 text-left text-base leading-snug sm:pl-16">
          {video.title}
        </DialogTitle>
        <DialogDescription className="pl-14 text-left sm:pl-16">
          {video.channel} · {video.clips.length} klip dihasilkan oleh AI
        </DialogDescription>
      </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-[300px_1fr]">
              {/* Player */}
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-border bg-black">
                  {clip && (
                    <iframe
                      key={clip.id}
                      title={clip.title}
                      className="aspect-[9/14] w-full"
                      src={`https://www.youtube.com/embed/${video.youtubeId}?start=${clip.startSec}&end=${clip.endSec}&rel=0&modestbranding=1&autoplay=1`}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                {clip && (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    disabled={busyId === clip.id}
                    onClick={() => download(clip, video, active)}
                  >
                    {busyId === clip.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Unduh MP4 · {formatTs(clip.startSec)}–{formatTs(clip.endSec)}
                  </Button>
                )}
                {clip && (
                  <div className="rounded-xl border border-border bg-muted/60 p-3">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Subtitle otomatis
                    </p>
                    <div className="max-h-36 space-y-1.5 overflow-y-auto yc-scrollbar">
                      {clip.subtitles.map((s, i) => (
                        <p
                          key={i}
                          className="rounded-lg bg-background px-2.5 py-1.5 text-xs leading-relaxed"
                        >
                          {s}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Daftar klip */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Pilih klip ({video.clips.length})
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {video.clips.map((c, i) => (
                    <ClipCard
                      key={c.id}
                      video={video}
                      index={i}
                      onPlay={() => setActive(i)}
                      downloading={busyId === c.id}
                      onDownload={() => download(c, video, i)}
                    />
                  ))}
                </div>
              </div>
            </div>
    </>
  );
}

function VideoDetailDialog({
  video,
  onClose,
}: {
  video: VideoDTO | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!video} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto yc-scrollbar sm:max-w-3xl">
        {video && <VideoDetailInner key={video.id} video={video} onBack={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

/* ================= Dashboard ================= */

export function DashboardPage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const [videos, setVideos] = useState<VideoDTO[] | null>(null);
  const [detail, setDetail] = useState<VideoDTO | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const data = await api<{ videos: VideoDTO[] }>("/api/videos");
      setVideos(data.videos);
      return data.videos;
    } catch {
      return null;
    }
  }, []);

  // Fetch awal + polling saat ada video yang diproses.
  // Pola data-fetching standar: setState terjadi di continuation async.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVideos().then((v) => {
      if (!alive || !v) return;
      const anyProcessing = v.some((x) => PROCESSING_STATUSES.includes(x.status));
      if (anyProcessing && !pollRef.current) {
        pollRef.current = setInterval(async () => {
          const list = await fetchVideos();
          if (list && !list.some((x) => PROCESSING_STATUSES.includes(x.status))) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            const done = list.find((x) => x.status === "COMPLETED");
            await refresh();
            if (done) {
              toast({
                title: "Klip siap!",
                description: `“${done.title.slice(0, 50)}” — 5 klip siap dipublikasikan.`,
              });
            }
          }
        }, 3000);
      }
    });
    return () => {
      alive = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [user, fetchVideos, refresh]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-bold">Silakan masuk terlebih dahulu.</p>
        <Button onClick={() => navigate("/auth/signin")} className="rounded-full">
          Masuk
        </Button>
      </div>
    );
  }

  const processing = videos?.filter((v) => PROCESSING_STATUSES.includes(v.status)) || [];
  const done = videos?.filter((v) => !PROCESSING_STATUSES.includes(v.status)) || [];

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Sambutan */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Halo, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tempel link YouTube panjang Anda, biar AI yang memotong momen
              terbaiknya.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => fetchVideos()}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Segarkan
            </Button>
          </div>
        </div>

        {/* Stats ringkas */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "Kredit tersisa", value: user.credits, icon: Coins },
            { label: "Video diproses", value: videos?.length ?? 0, icon: History },
            {
              label: "Klip dihasilkan",
              value: videos?.reduce((a, v) => a + v.clips.length, 0) ?? 0,
              icon: FileText,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <s.icon className="mb-2 h-4 w-4 text-primary" />
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Submit */}
        <SubmitForm onSubmitted={() => fetchVideos()} />

        {/* Sedang diproses */}
        {videos === null ? (
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {processing.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Sedang Diproses ({processing.length})
                </h2>
                <div className="space-y-3">
                  {processing.map((v) => (
                    <VideoCard key={v.id} video={v} onOpen={setDetail} />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                <History className="h-4 w-4" />
                Riwayat Video ({done.length})
              </h2>
              {done.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <p className="text-sm font-semibold">Belum ada video selesai.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tempel link YouTube pertama Anda di atas untuk mulai.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {done.map((v) => (
                    <VideoCard key={v.id} video={v} onOpen={setDetail} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="mt-auto border-t border-border bg-background py-6 text-center text-xs text-muted-foreground">
        © 2025 YouClip · AI Video Clipper Indonesia
      </footer>

      <VideoDetailDialog video={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
