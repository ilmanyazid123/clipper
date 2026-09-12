"use client";

/* Helper fetch API + state autentikasi global (zustand) */

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import type { SessionUser } from "@/lib/types";

export async function api<T>(
  path: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(path, {
    method: options?.method || "GET",
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Terjadi kesalahan.");
  }
  return data as T;
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  setUser: (u: SessionUser | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (u) => set({ user: u, loading: false }),
  refresh: async () => {
    try {
      const data = await api<{ user: SessionUser | null }>("/api/auth/me");
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    await api("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));

/* ---------- Hash routing sederhana ---------- */

export function navigate(to: string) {
  window.location.hash = to;
  window.scrollTo({ top: 0 });
}

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

function getHashSnapshot(): string {
  return window.location.hash.replace(/^#/, "") || "/";
}

function getServerSnapshot(): string {
  return "/";
}

export function useHashRoute(): string {
  const route = useSyncExternalStore(
    subscribeHash,
    getHashSnapshot,
    getServerSnapshot,
  );
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);
  return route;
}

/* ---------- Format helpers ---------- */

export function formatIDR(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}

export function formatTs(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(sec: number): string {
  if (!sec) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h} jam ${m} mnt`;
  if (m > 0) return `${m} mnt ${s} dtk`;
  return `${s} dtk`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}
