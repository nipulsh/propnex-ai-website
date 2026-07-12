"use client";

import { Bot } from "lucide-react";

import { Input } from "@/components/ui/input";

type AgentIdentitySectionProps = {
  agentName: string;
  avatarGradient: string;
  onNameChange: (name: string) => void;
};

export function AgentIdentitySection({
  agentName,
  avatarGradient,
  onNameChange,
}: AgentIdentitySectionProps) {
  return (
    <section className="flex gap-4">
      <div
        className={`flex size-16 shrink-0 items-center justify-center rounded-xl ring-1 ring-propnex-border ${avatarGradient}`}
      >
        <Bot className="size-8 text-foreground/90" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <label className="text-xs text-propnex-muted">Agent Name</label>
        <Input
          value={agentName}
          onChange={(event) => onNameChange(event.target.value)}
          className="h-10 border-propnex-border bg-propnex-bg text-foreground"
        />
      </div>
    </section>
  );
}
