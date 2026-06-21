"use client";

import { useCallback, useRef, useState } from "react";
import { Pause, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  claimAgentPlayback,
  releaseAgentPlayback,
} from "@/lib/agent-audio-playback";
import type { Agent } from "@/lib/agents-data";
import { cn } from "@/lib/utils";

type HearAgentButtonProps = {
  agent: Agent;
  className?: string;
};

export function HearAgentButton({ agent, className }: HearAgentButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    releaseAgentPlayback(stopPlayback);
    setIsPlaying(false);
  }, []);

  const playDemo = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    claimAgentPlayback(stopPlayback);

    if (agent.demoAudioUrl) {
      const audio = new Audio(agent.demoAudioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        releaseAgentPlayback(stopPlayback);
        setIsPlaying(false);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        speakFirstMessage();
      };
      setIsPlaying(true);
      void audio.play().catch(() => {
        setIsPlaying(false);
        speakFirstMessage();
      });
      return;
    }

    speakFirstMessage();

    function speakFirstMessage() {
      if (!window.speechSynthesis) {
        releaseAgentPlayback(stopPlayback);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(agent.firstMessage);
      utterance.onend = () => {
        releaseAgentPlayback(stopPlayback);
        setIsPlaying(false);
      };
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [agent.demoAudioUrl, agent.firstMessage, isPlaying, stopPlayback]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={playDemo}
      className={cn(
        "gap-1.5 border-propnex-border bg-propnex-panel text-xs",
        className,
      )}
    >
      {isPlaying ? (
        <>
          <Pause className="size-3.5" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="size-3.5" />
          Hear Agent
        </>
      )}
    </Button>
  );
}
