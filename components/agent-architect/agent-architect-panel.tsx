"use client";

import { ChevronDown, X } from "lucide-react";

import { AgentIdentitySection } from "@/components/agent-architect/agent-identity-section";
import { LanguageTagsInput } from "@/components/agent-architect/language-tags-input";
import { VoiceCloningSection } from "@/components/agent-architect/voice-cloning-section";
import { VoiceGenderToggle } from "@/components/agent-architect/voice-gender-toggle";
import { AGENT_CATEGORIES, ACCENT_OPTIONS } from "@/lib/agents-data";
import { cn } from "@/lib/utils";
import { useAgentArchitectStore } from "@/stores/agent-architect-store";

const fieldClassName =
  "h-10 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus:border-propnex-accent";

export function AgentArchitectPanel() {
  const isOpen = useAgentArchitectStore((state) => state.isOpen);
  const config = useAgentArchitectStore((state) => state.config);
  const close = useAgentArchitectStore((state) => state.close);
  const updateConfig = useAgentArchitectStore((state) => state.updateConfig);
  const addLanguage = useAgentArchitectStore((state) => state.addLanguage);
  const removeLanguage = useAgentArchitectStore((state) => state.removeLanguage);

  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "shrink-0 overflow-hidden border-r border-propnex-border bg-propnex-panel transition-[width] duration-300 ease-in-out",
        isOpen ? "w-[min(100%,420px)]" : "w-0 border-r-0"
      )}
    >
      <div className="flex h-full w-[420px] flex-col">
        <header className="flex items-center justify-between border-b border-propnex-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Agent Architect</h2>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1.5 text-propnex-muted transition-colors hover:bg-propnex-bg hover:text-foreground"
            aria-label="Close Agent Architect"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <AgentIdentitySection
            agentName={config.agentName}
            avatarGradient={config.avatarGradient}
            onNameChange={(agentName) => updateConfig({ agentName })}
          />

          <div className="space-y-2">
            <label className="text-xs text-propnex-muted">Category</label>
            <div className="relative">
              <select
                value={config.category}
                onChange={(event) => updateConfig({ category: event.target.value })}
                className={fieldClassName}
              >
                {AGENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-propnex-muted">Supported Languages</label>
            <LanguageTagsInput
              languages={config.languages}
              onAdd={addLanguage}
              onRemove={removeLanguage}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">Voice Gender</label>
              <VoiceGenderToggle
                value={config.voiceGender}
                onChange={(voiceGender) => updateConfig({ voiceGender })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">Accent</label>
              <div className="relative">
                <select
                  value={config.accent}
                  onChange={(event) => updateConfig({ accent: event.target.value })}
                  className={fieldClassName}
                >
                  {ACCENT_OPTIONS.map((accent) => (
                    <option key={accent} value={accent}>
                      {accent}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
              </div>
            </div>
          </div>

          <VoiceCloningSection />

          <div className="space-y-2">
            <label className="text-xs text-propnex-muted">Personality Prompt</label>
            <textarea
              value={config.personalityPrompt}
              onChange={(event) =>
                updateConfig({ personalityPrompt: event.target.value })
              }
              placeholder="Describe the agent's behavior, tone, and specific instructions..."
              rows={5}
              className="w-full resize-none rounded-xl border border-propnex-border bg-propnex-bg px-3 py-2.5 text-sm text-foreground placeholder:text-propnex-muted outline-none focus:border-propnex-accent"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
