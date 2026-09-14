/* Tipe bersama frontend & backend */

export interface ClipDraft {
  title: string;
  hook: string;
  startSec: number;
  endSec: number;
  viralScore: number;
  subtitles: string[];
}

export interface ClipDTO {
  id: string;
  order: number;
  title: string;
  hook: string;
  startSec: number;
  endSec: number;
  viralScore: number;
  subtitles: string[];
}

export interface VideoDTO {
  id: string;
  youtubeId: string;
  url: string;
  title: string;
  channel: string;
  thumbnail: string;
  durationSec: number;
  status: string;
  progress: number;
  stageText: string;
  createdAt: string;
  clips: ClipDTO[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  credits: number;
  role: string;
}

export interface TransactionDTO {
  id: string;
  type: string;
  credits: number;
  packageName: string | null;
  priceIdr: number | null;
  description: string;
  createdAt: string;
}
