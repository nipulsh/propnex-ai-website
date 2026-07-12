"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExpandablePromptBlockProps = {
  title: string;
  content: string;
  collapsedLines?: number;
};

export function ExpandablePromptBlock({
  title,
  content,
  collapsedLines = 4,
}: ExpandablePromptBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const lines = content.split("\n");
  const shouldTruncate = lines.length > collapsedLines && !expanded;
  const displayContent = shouldTruncate
    ? lines.slice(0, collapsedLines).join("\n") + "..."
    : content;

  return (
    <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-1.5 border-propnex-border bg-propnex-bg text-xs"
        >
          {copied ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        className={cn(
          "propnex-scrollbar mt-3 max-h-96 overflow-auto rounded-lg border border-propnex-border bg-propnex-bg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/90",
        )}
      >
        {displayContent}
      </pre>
      {lines.length > collapsedLines ? (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-propnex-accent hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="size-3.5" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" />
              Expand full prompt
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
