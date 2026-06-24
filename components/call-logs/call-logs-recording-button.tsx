"use client";

import { useCallback, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CallLogsRecordingButtonProps = {
  recordingUrl: string | null;
  hasRecording: boolean;
};

export function CallLogsRecordingButton({
  recordingUrl,
  hasRecording,
}: CallLogsRecordingButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void audio.play();
    setIsPlaying(true);
  }, [isPlaying]);

  if (!hasRecording || !recordingUrl) {
    return <span className="text-xs text-propnex-muted">—</span>;
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={recordingUrl}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={togglePlay}
        className={cn(
          "h-8 gap-1.5 border-propnex-border bg-propnex-panel px-2.5 text-xs text-propnex-accent hover:bg-propnex-accent/10",
        )}
        aria-label={isPlaying ? "Pause recording" : "Play recording"}
      >
        {isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </>
  );
}
