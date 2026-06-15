import { DetailSection } from "@/components/call-details/detail-section";
import { ConnectionStatusBadge } from "@/components/setup/connection-status-badge";
import type { AgentAssignedPhoneNumber } from "@/lib/agent-detail-data";
import type { Agent } from "@/lib/agents-data";
import { PROVIDER_LABELS } from "@/lib/setup-data";
import { cn } from "@/lib/utils";

type AgentResourcesSectionProps = {
  agent: Agent;
  phoneNumbers: AgentAssignedPhoneNumber[];
};

export function AgentResourcesSection({
  agent,
  phoneNumbers,
}: AgentResourcesSectionProps) {
  return (
    <DetailSection
      id="resources"
      title="Assigned Resources"
      description="Phone numbers and server infrastructure connected to this agent."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel">
          <div className="border-b border-propnex-border px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">
              Assigned Phone Numbers
            </h3>
          </div>
          {phoneNumbers.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-propnex-muted">
              No phone numbers assigned to this agent.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
                    <th className="px-5 py-3 font-medium">Number</th>
                    <th className="px-5 py-3 font-medium">Provider</th>
                    <th className="px-5 py-3 font-medium">Direction</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {phoneNumbers.map((pn) => (
                    <tr
                      key={pn.id}
                      className="border-b border-propnex-border/60 last:border-0"
                    >
                      <td className="px-5 py-3 font-mono text-foreground">
                        {pn.number}
                      </td>
                      <td className="px-5 py-3 text-propnex-muted">
                        {PROVIDER_LABELS[pn.provider as keyof typeof PROVIDER_LABELS] ??
                          pn.provider}
                      </td>
                      <td className="px-5 py-3 capitalize text-foreground">
                        {pn.direction}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                            pn.status === "active"
                              ? "bg-success/15 text-success"
                              : "bg-propnex-bg text-propnex-muted",
                          )}
                        >
                          {pn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Server Information
          </h3>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Connected Provider
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {agent.server.provider}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Region
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {agent.server.region}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Environment
              </dt>
              <dd className="mt-1 text-sm capitalize text-foreground">
                {agent.server.environment}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Connection Status
              </dt>
              <dd className="mt-1">
                <ConnectionStatusBadge
                  status={
                    agent.server.connectionStatus === "connected"
                      ? "connected"
                      : agent.server.connectionStatus === "degraded"
                        ? "warning"
                        : "disconnected"
                  }
                />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </DetailSection>
  );
}
