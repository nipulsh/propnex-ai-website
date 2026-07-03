"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Plus, X } from "lucide-react";

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
import {
  createAgentOnServer,
  updateAgentOnServer,
} from "@/hooks/use-agents-graphql";
import { useAgentsStore } from "@/stores/agents-store";
import { fetchAgentDetail } from "@/lib/graphql/api";
import { mapGraphQLAgentToUI } from "@/lib/mappers/agent.mapper";

const fieldClassName =
  "h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus:border-propnex-accent";

const MONITOR_OPTIONS = [
  "Compliance Monitoring",
  "Quality Monitoring",
  "Lead Qualification Monitoring",
];

function StepHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 border-b border-propnex-border pb-4">
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-propnex-muted">{description}</p>
      ) : null}
    </div>
  );
}

function CreateAgentWizardInner({ editId: editIdProp }: { editId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = editIdProp ?? searchParams.get("edit") ?? undefined;

  const agents = useAgentsStore((s) => s.agents);
  const upsertAgent = useAgentsStore((s) => s.upsertAgent);
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
    if (!editId) return;

    const agent = agents.find((a) => a.id === editId);
    if (agent) {
      loadFromAgent(agent);
      return () => reset();
    }

    let cancelled = false;
    void fetchAgentDetail(editId).then((res) => {
      if (cancelled || !res.agents.byId) return;
      const mapped = mapGraphQLAgentToUI(res.agents.byId as never);
      upsertAgent(mapped);
      loadFromAgent(mapped);
    });

    return () => {
      cancelled = true;
      reset();
    };
  }, [editId, agents, loadFromAgent, reset, upsertAgent]);

  function handleNext() {
    if (currentStep < CREATE_AGENT_STEPS.length) setStep(currentStep + 1);
  }

  function handleBack() {
    if (currentStep > 1) setStep(currentStep - 1);
  }

  async function handleCreate() {
    const input = draftToAgentInput(draft);
    if (editAgentId) {
      const updated = await updateAgentOnServer(
        editAgentId,
        input as Record<string, unknown>,
      );
      updateAgent(editAgentId, updated);
      router.push(`/agents/${editAgentId}`);
    } else {
      const agent = await createAgentOnServer(input);
      upsertAgent(agent);
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 space-y-4 border-b border-propnex-border px-6 pt-6 pb-4">
        <PageHeader
          title={isEdit ? "Edit Agent" : "Add Agent"}
          description="Full configuration wizard for power users who need complete control."
        />

        <WizardStepper
          steps={[...CREATE_AGENT_STEPS]}
          currentStep={currentStep}
        />
      </div>

      <div className="propnex-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
        {currentStep === 1 ? (
          <div className="space-y-6">
            <StepHeader
              title="Basics"
              description="Set your agent's identity, type, and supported languages."
            />
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
            <StepHeader
              title="Voice"
              description="Choose how your agent sounds during conversations."
            />
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
            <VoiceCloningSection />
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-4">
            <StepHeader
              title="Prompt"
              description="Define the opening message and system instructions for your agent."
            />
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
          <div className="space-y-4">
            <StepHeader
              title="AI Model"
              description="Configure the language model and speech transcription settings."
            />
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
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className="space-y-3">
            <StepHeader
              title="Knowledge"
              description="Select knowledge sources your agent can reference during calls."
            />
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
            <StepHeader
              title="Integrations"
              description="Connect external services your agent can use during conversations."
            />
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
            <StepHeader
              title="Outputs"
              description="Define structured data fields to extract from each conversation."
            />
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
            <StepHeader
              title="Monitoring"
              description="Enable quality and compliance monitoring for this agent."
            />
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
            <StepHeader
              title="Testing"
              description="Run a simulated call to preview how your agent responds."
            />
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
            <StepHeader
              title="Deploy"
              description={
                isEdit
                  ? "Review your changes before saving."
                  : "Review your configuration before creating the agent."
              }
            />
            <dl className="divide-y divide-propnex-border rounded-lg border border-propnex-border bg-propnex-bg text-sm">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Name</dt>
                <dd className="text-right font-medium">{draft.agentName || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Type</dt>
                <dd className="capitalize">{draft.type}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Category</dt>
                <dd>{draft.category}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Languages</dt>
                <dd className="text-right">{draft.languages.join(", ") || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Voice</dt>
                <dd>
                  {draft.accent}{" "}
                  {draft.voiceGender === "F"
                    ? "Female"
                    : draft.voiceGender === "M"
                      ? "Male"
                      : "Neutral"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Model</dt>
                <dd>
                  {draft.modelProvider} / {draft.modelName}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Transcriber</dt>
                <dd>
                  {draft.transcriberProvider} ({draft.transcriberLanguage})
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Knowledge Sources</dt>
                <dd className="text-right">
                  {Object.entries(draft.knowledgeEnabled)
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => key)
                    .join(", ") || "None"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Integrations</dt>
                <dd className="text-right">
                  {Object.entries(draft.integrations)
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => key)
                    .join(", ") || "None"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Structured Outputs</dt>
                <dd className="text-right">
                  {draft.structuredOutputNames.length > 0
                    ? draft.structuredOutputNames.join(", ")
                    : "None"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-propnex-muted">Monitors</dt>
                <dd className="text-right">
                  {draft.monitors.length > 0 ? draft.monitors.join(", ") : "None"}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-propnex-border bg-propnex-bg px-6 py-4">
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
    </div>
  );
}

export function CreateAgentPageContent({ editId }: { editId?: string } = {}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6 text-propnex-muted">
          Loading wizard...
        </div>
      }
    >
      <CreateAgentWizardInner editId={editId} />
    </Suspense>
  );
}
