"use client";

import { Scissors } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const text = size === "sm" ? "text-base" : "text-lg";
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <span
        className={`${box} inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm`}
      >
        <Scissors className={icon} />
      </span>
      <span className={`${text} font-bold tracking-tight text-foreground`}>
        You<span className="text-primary">Clip</span>
      </span>
    </span>
  );
}
