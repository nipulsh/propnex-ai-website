"use client";

import { useState } from "react";
import { AlertCircle, Clock, Crown, Loader2, RotateCcw } from "lucide-react";

import { HearAgentButton } from "@/components/agents/hear-agent-button";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAgentLibraryTemplate } from "@/hooks/use-agent-library-graphql";
import { cn } from "@/lib/utils";

type TemplateConfigurePageContentProps = {
  templateId: string;
};

export function TemplateConfigurePageContent({
  templateId,
}: TemplateConfigurePageContentProps) {
  const { template, loading, error } = useAgentLibraryTemplate(templateId);

  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(
    null,
  );
  const [agentName, setAgentName] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [prompt, setPrompt] = useState("");

  if (template && template.id !== loadedTemplateId) {
    setLoadedTemplateId(template.id);
    setAgentName(template.name);
    setVoiceId(template.compatibleVoices[0]?.id ?? "");
    setPrompt(template.samplePrompt);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <Loader2 className="size-8 animate-spin text-propnex-accent" />
        <p className="text-sm text-propnex-muted">Loading template...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-sm text-propnex-muted">
          {error ?? "Template not found."}
        </p>
      </div>
    );
  }

  const isPromptModified = prompt !== template.samplePrompt;

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <PageHeader
        title={`Configure ${template.name}`}
        description="Review the agent's details and tune its prompt before deploying."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
                template.category === "Premium"
                  ? "border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-yellow-600/15 text-amber-200"
                  : "border-propnex-border bg-propnex-bg text-propnex-muted",
              )}
            >
              {template.category === "Premium" ? (
                <Crown className="size-3 text-amber-400" />
              ) : null}
              {template.category}
            </span>

            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {template.profile}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-propnex-muted">
                <Clock className="size-3.5 text-propnex-accent" />
                ~{template.estimatedSetupMinutes} min setup
              </div>
              <HearAgentButton
                agent={{
                  id: template.id,
                  name: template.name,
                  demoAudioUrl: template.demoAudioUrl,
                  firstMessage: template.defaultFirstMessage,
                } as never}
              />
            </div>

            <div className="mt-5">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Supported Use Cases
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-propnex-muted">
                {template.useCases.map((uc) => (
                  <li key={uc}>{uc}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-medium text-foreground">
                  Agent Prompt
                </label>
                <p className="mt-1 text-xs text-propnex-muted">
                  Edit the tone, personality, and behavior of this agent.
                </p>
              </div>
              {isPromptModified ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(template.samplePrompt)}
                  className="h-8 shrink-0 gap-1.5 border-propnex-border bg-propnex-bg text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  Reset to Default
                </Button>
              ) : null}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={12}
              placeholder="Describe how this agent should speak and behave..."
              className="mt-3 w-full resize-none rounded-xl border border-propnex-border bg-propnex-bg px-3 py-2.5 font-mono text-sm outline-none focus:border-propnex-accent"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
            <label className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Agent Name
            </label>
            <Input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="mt-2 h-10 border-propnex-border bg-propnex-bg"
            />
          </div>

          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Voice
            </p>
            <div className="mt-3 space-y-2">
              {template.compatibleVoices.map((voice) => (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setVoiceId(voice.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                    voiceId === voice.id
                      ? "border-propnex-accent bg-propnex-accent/10"
                      : "border-propnex-border bg-propnex-bg hover:border-propnex-accent/30",
                  )}
                >
                  <span className="text-sm font-medium text-foreground">
                    {voice.name}
                  </span>
                  <span className="text-xs text-propnex-muted">
                    {voice.provider}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-propnex-border bg-propnex-panel/50 p-4 text-center text-xs text-propnex-muted">
            Deploying agents from the library is coming soon. Your changes
            here won&apos;t be saved yet.
          </div>
        </div>
      </div>
    </div>
  );
}
