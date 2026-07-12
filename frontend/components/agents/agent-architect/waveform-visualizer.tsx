"use client";

import { cn } from "@/lib/utils";

const barHeights = [
  28, 42, 18, 56, 34, 48, 22, 60, 38, 52, 26, 44, 32, 58, 20, 46, 36, 54, 24,
  50, 30, 40, 16, 62,
];

export function WaveformVisualizer() {
  return (
    <div className="flex h-16 items-end justify-between gap-1 px-1">
      {barHeights.map((height, index) => (
        <span
          key={index}
          className={cn(
            "w-1.5 shrink-0 rounded-full",
            index % 3 === 0 ? "bg-propnex-accent/80" : "bg-propnex-accent/25"
          )}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
