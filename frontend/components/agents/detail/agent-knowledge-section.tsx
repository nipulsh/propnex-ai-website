import { DetailSection } from "@/components/call-details/detail-section";
import type { Agent } from "@/lib/agents-data";
import { cn } from "@/lib/utils";

type AgentKnowledgeSectionProps = {
  agent: Agent;
};

const INTEGRATION_TYPE_LABELS: Record<string, string> = {
  crm: "CRM",
  calendar: "Calendar",
  webhook: "Webhook",
  email: "Email",
  messaging: "Messaging",
  api: "Third-Party API",
};

const KNOWLEDGE_TYPE_LABELS: Record<string, string> = {
  document: "Document",
  faq: "FAQ",
  url: "URL",
  "knowledge-base": "Knowledge Base",
};

export function AgentKnowledgeSection({ agent }: AgentKnowledgeSectionProps) {
  return (
    <DetailSection
      id="knowledge"
      title="Knowledge & Integrations"
      description="Knowledge sources and connected integrations for this agent."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel">
          <div className="border-b border-propnex-border px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">
              Knowledge Sources
            </h3>
          </div>
          {agent.knowledgeSources.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-propnex-muted">
              No knowledge sources connected.
            </p>
          ) : (
            <ul className="divide-y divide-propnex-border">
              {agent.knowledgeSources.map((source) => (
                <li
                  key={source.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {source.name}
                    </p>
                    <p className="text-xs text-propnex-muted">
                      {KNOWLEDGE_TYPE_LABELS[source.type] ?? source.type}
                    </p>
                  </div>
                  <StatusPill
                    label={source.status}
                    variant={
                      source.status === "synced" ? "success" : "muted"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-propnex-border bg-propnex-panel">
          <div className="border-b border-propnex-border px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">
              Connected Integrations
            </h3>
          </div>
          {agent.integrations.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-propnex-muted">
              No integrations connected.
            </p>
          ) : (
            <ul className="divide-y divide-propnex-border">
              {agent.integrations.map((integration) => (
                <li
                  key={integration.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {integration.name}
                    </p>
                    <p className="text-xs text-propnex-muted">
                      {INTEGRATION_TYPE_LABELS[integration.type] ??
                        integration.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill
                      label={integration.status}
                      variant={
                        integration.status === "connected"
                          ? "success"
                          : "muted"
                      }
                    />
                    <StatusPill
                      label={integration.health}
                      variant={
                        integration.health === "healthy"
                          ? "success"
                          : integration.health === "degraded"
                            ? "warning"
                            : "error"
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DetailSection>
  );
}

function StatusPill({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "warning" | "error" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium capitalize",
        variant === "success" && "bg-success/15 text-success",
        variant === "warning" && "bg-orange-400/15 text-orange-400",
        variant === "error" && "bg-destructive/15 text-destructive",
        variant === "muted" && "bg-propnex-bg text-propnex-muted",
      )}
    >
      {label}
    </span>
  );
}
