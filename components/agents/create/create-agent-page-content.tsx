"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, Plus, X } from "lucide-react";

import { AgentIdentitySection } from "@/components/agents/agent-architect/agent-identity-section";
import { LanguageTagsInput } from "@/components/agents/agent-architect/language-tags-input";
import { VoiceCloningSection } from "@/components/agents/agent-architect/voice-cloning-section";
import { VoiceGenderToggle } from "@/components/agents/agent-architect/voice-gender-toggle";
import { WizardStepper } from "@/components/agents/common/wizard-stepper";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ACCENT_OPTIONS,
  AGENT_CATEGORIES,
  type AgentType,
} from "@/lib/agents-data";
import {
  CREATE_AGENT_STEPS,
  draftToAgentInput,
  useCreateAgentStore,
} from "@/stores/create-agent-store";
import { useAgentsStore } from "@/stores/agents-store";

const fieldClassName =
  "h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus:border-propnex-accent";

const MONITOR_OPTIONS = [
  "Compliance Monitoring",
  "Quality Monitoring",
  "Lead Qualification Monitoring",
];

function CreateAgentWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const agents = useAgentsStore((s) => s.agents);
  const createAgent = useAgentsStore((s) => s.createAgent);
  const updateAgent = useAgentsStore((s) => s.updateAgent);

  const currentStep = useCreateAgentStore((s) => s.currentStep);
  const draft = useCreateAgentStore((s) => s.draft);
  const editAgentId = useCreateAgentStore((s) => s.editAgentId);
  const testResult = useCreateAgentStore((s) => s.testResult);
  const setStep = useCreateAgentStore((s) => s.setStep);
  const updateDraft = useCreateAgentStore((s) => s.updateDraft);
  const addLanguage = useCreateAgentStore((s) => s.addLanguage);
  const removeLanguage = useCreateAgentStore((s) => s.removeLanguage);
  const addStructuredOutput = useCreateAgentStore((s) => s.addStructuredOutput);
  const removeStructuredOutput = useCreateAgentStore(
    (s) => s.removeStructuredOutput,
  );
  const toggleMonitor = useCreateAgentStore((s) => s.toggleMonitor);
  const loadFromAgent = useCreateAgentStore((s) => s.loadFromAgent);
  const setTestResult = useCreateAgentStore((s) => s.setTestResult);
  const reset = useCreateAgentStore((s) => s.reset);

  const [newOutputName, setNewOutputName] = useState("");

  useEffect(() => {
    if (editId) {
      const agent = agents.find((a) => a.id === editId);
      if (agent) loadFromAgent(agent);
    }
    return () => reset();
  }, [editId, agents, loadFromAgent, reset]);

  function handleNext() {
    if (currentStep < CREATE_AGENT_STEPS.length) setStep(currentStep + 1);
  }

  function handleBack() {
    if (currentStep > 1) setStep(currentStep - 1);
  }

  function handleCreate() {
    const input = draftToAgentInput(draft);
    if (editAgentId) {
      updateAgent(editAgentId, input);
      router.push(`/agents/${editAgentId}`);
    } else {
      const agent = createAgent(input);
      router.push(`/agents/${agent.id}`);
    }
  }

  function handleTestCall() {
    setTestResult(
      `[Simulated] Agent: "${draft.firstMessage || "Hello!"}"\nLead: "Hi, I'm interested in your services."\nAgent: "Great! I'd be happy to help you today."`,
    );
  }

  const isEdit = Boolean(editAgentId);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/agents" />}
        className="w-fit gap-2 px-0 text-propnex-muted hover:bg-transparent hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Agents
      </Button>

      <PageHeader
        title={isEdit ? "Edit Agent" : "Add Agent"}
        description="Full configuration wizard for power users who need complete control."
      />

      <WizardStepper
        steps={[...CREATE_AGENT_STEPS]}
        currentStep={currentStep}
      />

      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
        {currentStep === 1 ? (
          <div className="space-y-6">
            <AgentIdentitySection
              agentName={draft.agentName}
              avatarGradient={draft.avatarGradient}
              onNameChange={(agentName) => updateDraft({ agentName })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-propnex-muted">Agent Type</label>
                <div className="relative">
                  <select
                    value={draft.type}
                    onChange={(e) =>
                      updateDraft({ type: e.target.value as AgentType })
                    }
                    className={fieldClassName}
                  >
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-propnex-muted">Category</label>
                <div className="relative">
                  <select
                    value={draft.category}
                    onChange={(e) => updateDraft({ category: e.target.value })}
                    className={fieldClassName}
                  >
                    {AGENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">Environment</label>
              <div className="flex gap-2">
                {(["production", "staging", "development"] as const).map(
                  (env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => updateDraft({ environment: env })}
                      className={`rounded-lg border px-4 py-2 text-sm capitalize ${
                        draft.environment === env
                          ? "border-propnex-accent bg-propnex-accent/10 text-propnex-accent"
                          : "border-propnex-border bg-propnex-bg text-propnex-muted"
                      }`}
                    >
                      {env}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">Languages</label>
              <LanguageTagsInput
                languages={draft.languages}
                onAdd={addLanguage}
                onRemove={removeLanguage}
              />
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-propnex-muted">Voice Gender</label>
                <VoiceGenderToggle
                  value={draft.voiceGender}
                  onChange={(voiceGender) => updateDraft({ voiceGender })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-propnex-muted">Accent</label>
                <div className="relative">
                  <select
                    value={draft.accent}
                    onChange={(e) => updateDraft({ accent: e.target.value })}
                    className={fieldClassName}
                  >
                    {ACCENT_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">Voice Provider</label>
              <div className="relative">
                <select
                  value={draft.voiceProvider}
                  onChange={(e) =>
                    updateDraft({ voiceProvider: e.target.value })
                  }
                  className={fieldClassName}
                >
                  <option value="ElevenLabs">ElevenLabs</option>
                  <option value="PlayHT">PlayHT</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
              </div>
            </div>
            <VoiceCloningSection />
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">First Message</label>
              <textarea
                value={draft.firstMessage}
                onChange={(e) => updateDraft({ firstMessage: e.target.value })}
                placeholder="Opening message used during conversations..."
                rows={3}
                className="w-full resize-none rounded-xl border border-propnex-border bg-propnex-bg px-3 py-2.5 text-sm outline-none focus:border-propnex-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">System Prompt</label>
              <textarea
                value={draft.systemPrompt}
                onChange={(e) => updateDraft({ systemPrompt: e.target.value })}
                placeholder="Complete system prompt for agent behavior..."
                rows={8}
                className="w-full resize-none rounded-xl border border-propnex-border bg-propnex-bg px-3 py-2.5 font-mono text-sm outline-none focus:border-propnex-accent"
              />
            </div>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">Model Provider</label>
              <select
                value={draft.modelProvider}
                onChange={(e) =>
                  updateDraft({ modelProvider: e.target.value })
                }
                className={fieldClassName}
              >
                <option value="OpenAI">OpenAI</option>
                <option value="Anthropic">Anthropic</option>
                <option value="Google">Google</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">Model Name</label>
              <Input
                value={draft.modelName}
                onChange={(e) => updateDraft({ modelName: e.target.value })}
                className="h-11 border-propnex-border bg-propnex-bg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">
                Transcriber Provider
              </label>
              <select
                value={draft.transcriberProvider}
                onChange={(e) =>
                  updateDraft({ transcriberProvider: e.target.value })
                }
                className={fieldClassName}
              >
                <option value="Deepgram">Deepgram</option>
                <option value="AssemblyAI">AssemblyAI</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-propnex-muted">Language</label>
              <Input
                value={draft.transcriberLanguage}
                onChange={(e) =>
                  updateDraft({ transcriberLanguage: e.target.value })
                }
                className="h-11 border-propnex-border bg-propnex-bg"
              />
            </div>
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className="space-y-3">
            {(
              [
                ["documents", "Uploaded Documents"],
                ["faq", "FAQs"],
                ["urls", "URLs"],
                ["knowledgeBase", "Knowledge Bases"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-propnex-border bg-propnex-bg p-4"
              >
                <span className="text-sm text-foreground">{label}</span>
                <input
                  type="checkbox"
                  checked={draft.knowledgeEnabled[key]}
                  onChange={(e) =>
                    updateDraft({
                      knowledgeEnabled: {
                        ...draft.knowledgeEnabled,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="size-4 accent-propnex-accent"
                />
              </label>
            ))}
            <p className="text-xs text-propnex-muted">
              File upload is simulated in this preview. Attach sources after
              deployment.
            </p>
          </div>
        ) : null}

        {currentStep === 6 ? (
          <div className="space-y-3">
            {(
              [
                ["crm", "CRM Integrations"],
                ["calendar", "Calendar Integrations"],
                ["webhooks", "Webhooks"],
                ["email", "Email Services"],
                ["messaging", "Messaging Services"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-propnex-border bg-propnex-bg p-4"
              >
                <span className="text-sm text-foreground">{label}</span>
                <input
                  type="checkbox"
                  checked={draft.integrations[key]}
                  onChange={(e) =>
                    updateDraft({
                      integrations: {
                        ...draft.integrations,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="size-4 accent-propnex-accent"
                />
              </label>
            ))}
            <p className="rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3 text-xs text-propnex-muted">
              For Google Sheets, Google Calendar, and per-agent tool permissions,
              connect services in{" "}
              <Link href="/settings" className="text-propnex-accent hover:underline">
                Settings &gt; Integrations
              </Link>{" "}
              and configure tools on the agent&apos;s{" "}
              <strong className="font-medium text-foreground">Agent Tools</strong>{" "}
              tab after deployment.
            </p>
          </div>
        ) : null}

        {currentStep === 7 ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newOutputName}
                onChange={(e) => setNewOutputName(e.target.value)}
                placeholder="e.g. Customer Name, Budget, Interest Level"
                className="h-11 border-propnex-border bg-propnex-bg"
              />
              <Button
                type="button"
                onClick={() => {
                  addStructuredOutput(newOutputName);
                  setNewOutputName("");
                }}
                className="h-11 shrink-0 gap-1.5"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.structuredOutputNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-propnex-border bg-propnex-bg px-2.5 py-1 text-sm"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeStructuredOutput(name)}
                    className="text-propnex-muted hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {currentStep === 8 ? (
          <div className="space-y-3">
            {MONITOR_OPTIONS.map((monitor) => (
              <label
                key={monitor}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-propnex-border bg-propnex-bg p-4"
              >
                <span className="text-sm text-foreground">{monitor}</span>
                <input
                  type="checkbox"
                  checked={draft.monitors.includes(monitor)}
                  onChange={() => toggleMonitor(monitor)}
                  className="size-4 accent-propnex-accent"
                />
              </label>
            ))}
          </div>
        ) : null}

        {currentStep === 9 ? (
          <div className="space-y-4">
            <Button type="button" onClick={handleTestCall} className="gap-2">
              Run Simulated Test Call
            </Button>
            {testResult ? (
              <pre className="rounded-lg border border-propnex-border bg-propnex-bg p-4 font-mono text-xs whitespace-pre-wrap text-foreground/90">
                {testResult}
              </pre>
            ) : (
              <p className="text-sm text-propnex-muted">
                Test your agent configuration before deployment.
              </p>
            )}
          </div>
        ) : null}

        {currentStep === 10 ? (
          <div className="space-y-4">
            <p className="text-sm text-propnex-muted">
              Review your configuration and {isEdit ? "save changes" : "deploy"}.
            </p>
            <dl className="space-y-2 rounded-lg border border-propnex-border bg-propnex-bg p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-propnex-muted">Name</dt>
                <dd>{draft.agentName || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-propnex-muted">Type</dt>
                <dd className="capitalize">{draft.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-propnex-muted">Environment</dt>
                <dd className="capitalize">{draft.environment}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-propnex-muted">Model</dt>
                <dd>
                  {draft.modelProvider} / {draft.modelName}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>

      <div className="flex gap-3">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="h-11 flex-1 border-propnex-border bg-propnex-panel"
          >
            Back
          </Button>
        ) : null}
        {currentStep < CREATE_AGENT_STEPS.length ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 1 && !draft.agentName.trim()}
            className="h-11 flex-1"
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleCreate}
            disabled={!draft.agentName.trim()}
            className="h-11 flex-1"
          >
            {isEdit ? "Save Agent" : "Add Agent"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function CreateAgentPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6 text-propnex-muted">
          Loading wizard...
        </div>
      }
    >
      <CreateAgentWizardInner />
    </Suspense>
  );
}
