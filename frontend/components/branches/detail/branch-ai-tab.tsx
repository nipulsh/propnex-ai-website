"use client";

import { useState } from "react";
import { Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateBranchAi } from "@/lib/graphql/api";
import type { BranchNode } from "@/lib/graphql/queries";
import { cn } from "@/lib/utils";

type BranchAiTabProps = {
  branch: BranchNode;
  onSaved: () => void;
  onNotify: (message: string, type: "success" | "error") => void;
};

export function BranchAiTab({ branch, onSaved, onNotify }: BranchAiTabProps) {
  const [aiEnabled, setAiEnabled] = useState(branch.aiEnabled);
  const [systemPrompt, setSystemPrompt] = useState(branch.systemPrompt ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateBranchAi(branch.id, {
        aiEnabled,
        systemPrompt: systemPrompt.trim() || null,
      });
      onNotify("AI configuration saved.", "success");
      onSaved();
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : "Unable to save AI configuration.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">AI Agent</p>
            <p className="text-sm text-propnex-muted">
              Enable and configure the AI agent for this branch.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={aiEnabled}
          onClick={() => setAiEnabled((v) => !v)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            aiEnabled ? "bg-primary" : "bg-propnex-border",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
              aiEnabled ? "translate-x-[1.375rem]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      <div className="space-y-2 rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <label
          htmlFor="ai-system-prompt"
          className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
        >
          System Prompt
        </label>
        <p className="text-sm text-propnex-muted">
          This prompt is unique to this branch and controls the behavior of its
          AI agent.
        </p>
        <textarea
          id="ai-system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={14}
          placeholder="You are the AI assistant for this branch…"
          className="mt-2 w-full resize-y rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-propnex-muted focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => void handleSave()} disabled={isSaving} className="h-10">
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
