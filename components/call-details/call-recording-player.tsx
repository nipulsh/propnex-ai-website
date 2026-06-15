"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Pause,
  Play,
  SkipBack,
  Volume2,
} from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/call-logs-data";
import type { CallDetail } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

type CallRecordingPlayerProps = {
  recording: CallDetail["recording"];
};

export function CallRecordingPlayer({ recording }: CallRecordingPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recording.lengthSeconds);
  const [speed, setSpeed] = useState(1);

  const isAvailable = recording.status === "available" && recording.url;

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const cycleSpeed = () => {
    const idx = PLAYBACK_SPEEDS.indexOf(speed);
    const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length]!;
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || recording.lengthSeconds);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [recording.lengthSeconds]);

  const statusLabel =
    recording.status === "available"
      ? "Available"
      : recording.status === "processing"
        ? "Processing"
        : "Unavailable";

  return (
    <DetailSection
      title="Call Recording"
      description="Listen to the full conversation recording."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        {isAvailable ? (
          <audio ref={audioRef} src={recording.url} preload="metadata" />
        ) : null}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-propnex-muted">Length:</span>
            <span className="font-medium text-foreground">
              {formatDuration(recording.lengthSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-propnex-muted">Status:</span>
            <span
              className={cn(
                "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                recording.status === "available"
                  ? "bg-success/10 text-success"
                  : recording.status === "processing"
                    ? "bg-orange-400/10 text-orange-400"
                    : "bg-propnex-muted/10 text-propnex-muted",
              )}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {!isAvailable ? (
          <p className="py-8 text-center text-sm text-propnex-muted">
            {recording.status === "processing"
              ? "Recording is being processed. Check back shortly."
              : "No recording available for this call."}
          </p>
        ) : (
          <>
            <div className="mb-4 flex h-12 items-end justify-between gap-0.5 px-1">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1 shrink-0 rounded-full",
                    i / 48 <= currentTime / duration
                      ? "bg-propnex-accent/80"
                      : "bg-propnex-accent/20",
                  )}
                  style={{
                    height: `${20 + Math.sin(i * 0.5) * 15 + (i % 5) * 4}%`,
                  }}
                />
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="range"
                min={0}
                max={duration || recording.lengthSeconds}
                value={currentTime}
                onChange={handleSeek}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[color-mix(in_srgb,var(--propnex-muted)_25%,var(--propnex-panel))] accent-propnex-accent"
              />
              <div className="flex justify-between text-xs text-propnex-muted">
                <span>{formatDuration(Math.floor(currentTime))}</span>
                <span>{formatDuration(Math.floor(duration))}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                >
                  <SkipBack className="size-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={togglePlay}
                  className="shadow-[0_0_16px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]"
                >
                  {isPlaying ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={cycleSpeed}>
                  {speed}x
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="size-4 text-propnex-muted" />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  nativeButton={false}
                  render={
                    <a href={recording.url} download={`recording-${recording.lengthSeconds}.mp3`} />
                  }
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DetailSection>
  );
}
