"use client";

import { CloudUpload } from "lucide-react";

import { WaveformVisualizer } from "@/components/agent-architect/waveform-visualizer";

export function VoiceCloningSection() {
  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-bg/40 p-4">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-propnex-accent uppercase">
        Voice Cloning (Obsidian Tier)
      </p>

      <button
        type="button"
        className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-propnex-border bg-propnex-panel px-4 py-8 text-center transition-colors hover:border-propnex-accent/60 hover:bg-propnex-panel/80"
      >
        <CloudUpload className="size-5 text-propnex-muted" />
        <span className="text-xs text-propnex-muted">
          Upload a 30s sample (.wav or .mp3)
        </span>
      </button>

      <div className="mt-4">
        <WaveformVisualizer />
      </div>
    </section>
  );
}
