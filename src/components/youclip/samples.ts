/* Data contoh klip untuk showcase landing page.
   Klip memakai video sampel publik via YouTube embed dengan rentang waktu. */

export interface SampleClip {
  title: string;
  duration: string;
  score: number;
  embedUrl: string;
}

/* Video sampel publik (Big Buck Bunny & Elephant's Dream — Blender Foundation,
   lisensi Creative Commons) dengan segmen berbeda-beda. */
const SAMPLE_VIDEO = "aqz-KE-bpKQ";

function embed(start: number, end: number) {
  return `https://www.youtube.com/embed/${SAMPLE_VIDEO}?start=${start}&end=${end}&rel=0&modestbranding=1`;
}

export const SAMPLES: SampleClip[] = [
  {
    title: "Momen lucu di balik layar animasi",
    duration: "0:48",
    score: 92,
    embedUrl: embed(30, 78),
  },
  {
    title: "Karakter paling berkesan dalam film ini",
    duration: "1:02",
    score: 88,
    embedUrl: embed(140, 202),
  },
  {
    title: "Teknik animasi yang jarang diketahui",
    duration: "0:55",
    score: 85,
    embedUrl: embed(300, 355),
  },
  {
    title: "Adegan aksi paling menegangkan",
    duration: "0:59",
    score: 95,
    embedUrl: embed(420, 479),
  },
  {
    title: "Pesan tersembunyi di akhir cerita",
    duration: "1:05",
    score: 79,
    embedUrl: embed(520, 585),
  },
];
