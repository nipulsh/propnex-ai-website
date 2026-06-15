import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Flame,
  PhoneCall,
  TrendingUp,
} from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import { StatCard } from "@/components/call-details/stat-card";
import type { AgentListMetrics } from "@/lib/agent-detail-data";
import { formatAgentDate, formatLastActivity } from "@/lib/agent-detail-data";
import type { Agent } from "@/lib/agents-data";

type AgentOverviewSectionProps = {
  agent: Agent;
  metrics: AgentListMetrics;
};

export function AgentOverviewSection({
  agent,
  metrics,
}: AgentOverviewSectionProps) {
  return (
    <DetailSection
      id="overview"
      title="Overview"
      description="Agent metadata and performance metrics."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5 sm:col-span-2 lg:col-span-3">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Agent Name
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {agent.name}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Type
              </dt>
              <dd className="mt-1 text-sm capitalize text-foreground">
                {agent.type}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Category
              </dt>
              <dd className="mt-1 text-sm text-foreground">{agent.category}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Environment
              </dt>
              <dd className="mt-1 text-sm capitalize text-foreground">
                {agent.environment}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Created
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatAgentDate(agent.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Last Modified
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatAgentDate(agent.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>

        <StatCard
          title="Total Calls"
          value={metrics.totalCalls.toLocaleString()}
          icon={PhoneCall}
        />
        <StatCard
          title="Inbound Calls"
          value={metrics.inboundCalls.toLocaleString()}
          icon={ArrowDownLeft}
        />
        <StatCard
          title="Outbound Calls"
          value={metrics.outboundCalls.toLocaleString()}
          icon={ArrowUpRight}
        />
        <StatCard
          title="Avg Call Duration"
          value={`${Math.floor(metrics.avgCallDurationSeconds / 60)}m ${metrics.avgCallDurationSeconds % 60}s`}
          icon={Clock}
        />
        <StatCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Hot Leads Generated"
          value={metrics.hotLeads.toLocaleString()}
          footer={formatLastActivity(metrics.lastActivity)}
          icon={Flame}
          iconClassName="text-orange-400"
        />
      </div>
    </DetailSection>
  );
}
