"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { WizardStepper } from "@/components/agents/common/wizard-stepper";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { templateToAgentDefaults } from "@/lib/agent-library-data";
import { createAgentOnServer } from "@/hooks/use-agents-graphql";
import { useAgentLibraryTemplate } from "@/hooks/use-agent-library-graphql";
import { useAgentDeployStore } from "@/stores/agent-deploy-store";
import { useAgentsStore } from "@/stores/agents-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

const STEPS = [
  { id: "name", label: "Name" },
  { id: "voice", label: "Voice" },
  { id: "phone", label: "Phone" },
  { id: "variables", label: "Variables" },
  { id: "deploy", label: "Deploy" },
];

type DeployAgentPageContentProps = {
  templateId: string;
};

export function DeployAgentPageContent({
  templateId,
}: DeployAgentPageContentProps) {
  const router = useRouter();
  const { template, loading, error } = useAgentLibraryTemplate(templateId);
  const phoneNumbers = usePhoneNumbersStore((s) => s.numbers);
  const upsertAgent = useAgentsStore((s) => s.upsertAgent);

  const currentStep = useAgentDeployStore((s) => s.currentStep);
  const config = useAgentDeployStore((s) => s.config);
  const setTemplateId = useAgentDeployStore((s) => s.setTemplateId);
  const setStep = useAgentDeployStore((s) => s.setStep);
  const updateConfig = useAgentDeployStore((s) => s.updateConfig);
  const setVariable = useAgentDeployStore((s) => s.setVariable);
  const reset = useAgentDeployStore((s) => s.reset);

  useEffect(() => {
    setTemplateId(templateId);
    if (template) {
      updateConfig({
        agentName: template.name,
        voiceId: template.compatibleVoices[0]?.id ?? "",
        variables: Object.fromEntries(
          template.defaultVariables.map((v) => [v.key, ""]),
        ),
      });
    }
    return () => reset();
  }, [templateId, template, setTemplateId, updateConfig, reset]);

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
        <Button nativeButton={false} render={<Link href="/agents/library" />}>
          Back to Library
        </Button>
      </div>
    );
  }

  function handleNext() {
    if (currentStep < 5) setStep(currentStep + 1);
  }

  function handleBack() {
    if (currentStep > 1) setStep(currentStep - 1);
  }

  async function handleDeploy() {
    if (!template) return;

    const defaults = templateToAgentDefaults(template, {
      agentName: config.agentName,
      voiceId: config.voiceId,
      phoneNumberId: config.phoneNumberId,
      variables: config.variables,
      environment: config.environment,
    });

    const agent = await createAgentOnServer({
      name: config.agentName,
      type: defaults.type ?? template.defaultType,
      category: defaults.category ?? template.category,
      environment: config.environment,
      enabled: true,
      languages: ["English (US)"],
      firstMessage: defaults.firstMessage ?? template.defaultFirstMessage,
      systemPrompt: defaults.systemPrompt ?? template.samplePrompt,
      demoAudioUrl: defaults.demoAudioUrl ?? template.demoAudioUrl,
      libraryEntryId: template.libraryEntryId,
      voice: defaults.voice,
      model: {
        provider: "OpenAI",
        name: "gpt-4o-mini",
        latencyMs: 450,
        estimatedCostPerMin: 0.012,
      },
      transcriber: {
        provider: "Deepgram",
        language: "en-US",
        latencyMs: 180,
        estimatedCostPerMin: 0.004,
      },
      server: {
        provider: "PropNex Cloud",
        region: "us-east-1",
        environment: config.environment,
        connectionStatus: "connected",
      },
      structuredOutputs: [],
      scorecards: [],
      monitors: [],
      knowledgeSources: [],
      integrations: [],
      status: "active",
      avatarGradient:
        defaults.avatarGradient ??
        template.avatarGradient ??
        "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
    });

    upsertAgent(agent);
    router.push(`/agents/${agent.id}`);
  }

  const selectedVoice = template.compatibleVoices.find(
    (v) => v.id === config.voiceId,
  );

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/agents/library" />}
        className="w-fit gap-2 px-0 text-propnex-muted hover:bg-transparent hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Library
      </Button>

      <PageHeader
        title={`Deploy ${template.name}`}
        description="Configure your agent and deploy in minutes."
      />

      <WizardStepper steps={STEPS} currentStep={currentStep} />

      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
        {currentStep === 1 ? (
          <div className="space-y-4">
            <label className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Agent Name
            </label>
            <Input
              value={config.agentName}
              onChange={(e) => updateConfig({ agentName: e.target.value })}
              className="h-11 border-propnex-border bg-propnex-bg"
            />
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-3">
            <p className="text-sm text-propnex-muted">Select a voice</p>
            {template.compatibleVoices.map((voice) => (
              <button
                key={voice.id}
                type="button"
                onClick={() => updateConfig({ voiceId: voice.id })}
                className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                  config.voiceId === voice.id
                    ? "border-propnex-accent bg-propnex-accent/10"
                    : "border-propnex-border bg-propnex-bg hover:border-propnex-accent/30"
                }`}
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
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-3">
            <p className="text-sm text-propnex-muted">
              Assign a phone number (optional)
            </p>
            <button
              type="button"
              onClick={() => updateConfig({ phoneNumberId: null })}
              className={`flex w-full rounded-lg border p-4 text-left text-sm ${
                config.phoneNumberId === null
                  ? "border-propnex-accent bg-propnex-accent/10"
                  : "border-propnex-border bg-propnex-bg"
              }`}
            >
              Skip for now
            </button>
            {phoneNumbers.map((pn) => (
              <button
                key={pn.id}
                type="button"
                onClick={() => updateConfig({ phoneNumberId: pn.id })}
                className={`flex w-full rounded-lg border p-4 text-left font-mono text-sm ${
                  config.phoneNumberId === pn.id
                    ? "border-propnex-accent bg-propnex-accent/10"
                    : "border-propnex-border bg-propnex-bg"
                }`}
              >
                {pn.number}
              </button>
            ))}
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="space-y-4">
            {template.defaultVariables.map((variable) => (
              <div key={variable.key}>
                <label className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                  {variable.label}
                </label>
                <Input
                  value={config.variables[variable.key] ?? ""}
                  onChange={(e) =>
                    setVariable(variable.key, e.target.value)
                  }
                  placeholder={variable.placeholder}
                  className="mt-1.5 h-11 border-propnex-border bg-propnex-bg"
                />
              </div>
            ))}
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className="space-y-4">
            <div>
              <label className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Environment
              </label>
              <div className="mt-2 flex gap-2">
                {(["production", "staging"] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => updateConfig({ environment: env })}
                    className={`rounded-lg border px-4 py-2 text-sm capitalize ${
                      config.environment === env
                        ? "border-propnex-accent bg-propnex-accent/10 text-propnex-accent"
                        : "border-propnex-border bg-propnex-bg text-propnex-muted"
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Review
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-propnex-muted">Name</dt>
                  <dd className="text-foreground">{config.agentName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-propnex-muted">Voice</dt>
                  <dd className="text-foreground">
                    {selectedVoice?.name ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-propnex-muted">Environment</dt>
                  <dd className="capitalize text-foreground">
                    {config.environment}
                  </dd>
                </div>
              </dl>
            </div>
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
        {currentStep < 5 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 1 && !config.agentName.trim()}
            className="h-11 flex-1"
          >
            Next
          </Button>
        ) : (
          <Button type="button" onClick={handleDeploy} className="h-11 flex-1">
            Deploy Agent
          </Button>
        )}
      </div>
    </div>
  );
}
