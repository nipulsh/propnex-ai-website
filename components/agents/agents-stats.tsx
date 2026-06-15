"use client";

import { useMemo } from "react";
import { Bot, PhoneCall, TrendingUp, Zap } from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import {
  getAgentListMetrics,
  getAgentsDashboardStats,
} from "@/lib/agent-detail-data";
import { useAgentsStore } from "@/stores/agents-store";

export function AgentsStats() {
  const agents = useAgentsStore((s) => s.agents);

  const stats = useMemo(
    () => getAgentsDashboardStats(agents, getAgentListMetrics),
    [agents],
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Agents"
        value={stats.totalAgents.toLocaleString()}
        icon={Bot}
      />
      <StatCard
        title="Active Agents"
        value={stats.activeAgents.toLocaleString()}
        footer={`${stats.totalAgents - stats.activeAgents} inactive`}
        icon={Zap}
        iconClassName="text-success"
      />
      <StatCard
        title="Total Calls"
        value={stats.totalCalls.toLocaleString()}
        icon={PhoneCall}
      />
      <StatCard
        title="Avg Conversion"
        value={`${stats.avgConversionRate}%`}
        footer="Across agents with calls"
        icon={TrendingUp}
      />
    </div>
  );
}
