import { DetailSection } from "@/components/call-details/detail-section";
import { ConfigDisplayCard } from "@/components/agents/common/config-display-card";
import { ExpandablePromptBlock } from "@/components/agents/common/expandable-prompt-block";
import type { Agent } from "@/lib/agents-data";

type AgentConfigurationSectionProps = {
  agent: Agent;
};

export function AgentConfigurationSection({
  agent,
}: AgentConfigurationSectionProps) {
  return (
    <DetailSection
      id="configuration"
      title="Agent Configuration"
      description="Voice, model, and prompt settings for this agent."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="text-sm font-semibold text-foreground">First Message</h3>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {agent.firstMessage}
          </p>
        </div>

        <ExpandablePromptBlock
          title="System Prompt"
          content={agent.systemPrompt}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ConfigDisplayCard
            title="Voice Configuration"
            items={[
              { label: "Provider", value: agent.voice.provider },
              { label: "Model", value: agent.voice.model },
              { label: "Voice Name", value: agent.voice.name },
              { label: "Latency", value: `${agent.voice.latencyMs}ms` },
            ]}
          />
          <ConfigDisplayCard
            title="AI Model Configuration"
            items={[
              { label: "Provider", value: agent.model.provider },
              { label: "Model Name", value: agent.model.name },
              { label: "Latency", value: `${agent.model.latencyMs}ms` },
              {
                label: "Est. Usage Cost",
                value: `$${agent.model.estimatedCostPerMin.toFixed(3)}/min`,
              },
            ]}
          />
          <ConfigDisplayCard
            title="Transcriber Configuration"
            items={[
              { label: "Provider", value: agent.transcriber.provider },
              { label: "Language", value: agent.transcriber.language },
              { label: "Latency", value: `${agent.transcriber.latencyMs}ms` },
              {
                label: "Est. Usage Cost",
                value: `$${agent.transcriber.estimatedCostPerMin.toFixed(3)}/min`,
              },
            ]}
          />
        </div>
      </div>
    </DetailSection>
  );
}
