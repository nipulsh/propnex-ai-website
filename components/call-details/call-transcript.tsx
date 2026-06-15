"use client";

import { useMemo, useState } from "react";
import { Bot, Copy, Search, User } from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CallDetail } from "@/lib/call-detail-data";
import { formatTranscriptTimestamp } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type CallTranscriptProps = {
  transcript: CallDetail["transcript"];
};

export function CallTranscript({ transcript }: CallTranscriptProps) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return transcript;
    const q = search.toLowerCase();
    return transcript.filter((entry) => entry.text.toLowerCase().includes(q));
  }, [transcript, search]);

  const handleCopy = async () => {
    const text = transcript
      .map(
        (e) =>
          `[${formatTranscriptTimestamp(e.timestamp)}] ${e.speaker === "agent" ? "AI Agent" : "Lead"}: ${e.text}`,
      )
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DetailSection
      title="Call Transcript"
      description="Full conversation transcript with speaker labels and timestamps."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel">
        <div className="flex flex-col gap-3 border-b border-propnex-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
            <Input
              placeholder="Search transcript..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-propnex-border bg-propnex-bg pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
            <Copy className="size-4" />
            {copied ? "Copied!" : "Copy Transcript"}
          </Button>
        </div>

        <div className="max-h-[480px] space-y-4 overflow-y-auto p-4 propnex-scrollbar">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-propnex-muted">
              {transcript.length === 0
                ? "No transcript available for this call."
                : "No matching transcript entries."}
            </p>
          ) : (
            filtered.map((entry) => {
              const isAgent = entry.speaker === "agent";
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex gap-3",
                    isAgent ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      isAgent
                        ? "bg-propnex-accent/15 text-propnex-accent"
                        : "bg-propnex-muted/15 text-propnex-muted",
                    )}
                  >
                    {isAgent ? (
                      <Bot className="size-4" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] space-y-1",
                      isAgent ? "text-right" : "text-left",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 text-xs text-propnex-muted",
                        isAgent && "justify-end",
                      )}
                    >
                      <span className="font-medium">
                        {isAgent ? "AI Agent" : "Lead"}
                      </span>
                      <span>{formatTranscriptTimestamp(entry.timestamp)}</span>
                    </div>
                    <p
                      className={cn(
                        "rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                        isAgent
                          ? "bg-propnex-accent/10 text-foreground"
                          : "bg-propnex-bg text-foreground",
                      )}
                    >
                      {entry.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DetailSection>
  );
}
