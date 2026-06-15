import type { Agent, AgentsDashboardStats } from "@/lib/agents-data";
import { callLogs } from "@/lib/call-logs-data";
import { getLeadTemperatureForCall } from "@/lib/call-detail-data";
import type { PhoneNumber } from "@/lib/phone-numbers-data";

export type AgentListMetrics = {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  lastActivity: number | null;
  conversionRate: number;
  hotLeads: number;
  avgCallDurationSeconds: number;
};

export type AgentAssignedPhoneNumber = {
  id: string;
  number: string;
  provider: string;
  direction: "inbound" | "outbound" | "both";
  status: string;
};

export function getCallsForAgent(agentId: string) {
  return callLogs
    .filter((log) => log.agentId === agentId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getAgentListMetrics(agentId: string): AgentListMetrics {
  const calls = getCallsForAgent(agentId);
  const inboundCalls = calls.filter((c) => c.direction === "inbound").length;
  const outboundCalls = calls.filter((c) => c.direction === "outbound").length;
  const completed = calls.filter((c) => c.status === "completed");
  const hotLeads = completed.filter(
    (c) => getLeadTemperatureForCall(c.id) === "hot",
  ).length;
  const conversionRate =
    completed.length > 0
      ? Math.round((hotLeads / completed.length) * 100)
      : 0;
  const avgCallDurationSeconds =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, c) => sum + c.durationSeconds, 0) /
            completed.length,
        )
      : 0;

  return {
    totalCalls: calls.length,
    inboundCalls,
    outboundCalls,
    lastActivity: calls[0]?.timestamp ?? null,
    conversionRate,
    hotLeads,
    avgCallDurationSeconds,
  };
}

export function getPhoneNumbersForAgent(
  phoneNumbers: PhoneNumber[],
  agentId: string,
): AgentAssignedPhoneNumber[] {
  return phoneNumbers
    .filter(
      (pn) =>
        pn.inboundAgentId === agentId || pn.outboundAgentId === agentId,
    )
    .map((pn) => {
      const inbound = pn.inboundAgentId === agentId;
      const outbound = pn.outboundAgentId === agentId;
      return {
        id: pn.id,
        number: pn.number,
        provider: pn.provider,
        direction:
          inbound && outbound ? "both" : inbound ? "inbound" : "outbound",
        status: pn.status,
      };
    });
}

export function getAgentsDashboardStats(
  agentList: Agent[],
  metricsForAgent: (id: string) => AgentListMetrics,
): AgentsDashboardStats {
  const activeAgents = agentList.filter(
    (a) => a.status === "active" && a.enabled,
  ).length;
  let totalCalls = 0;
  let conversionSum = 0;
  let agentsWithCalls = 0;

  for (const agent of agentList) {
    const m = metricsForAgent(agent.id);
    totalCalls += m.totalCalls;
    if (m.totalCalls > 0) {
      conversionSum += m.conversionRate;
      agentsWithCalls += 1;
    }
  }

  return {
    totalAgents: agentList.length,
    activeAgents,
    totalCalls,
    avgConversionRate:
      agentsWithCalls > 0 ? Math.round(conversionSum / agentsWithCalls) : 0,
  };
}

export function findAgentInList(
  agentList: Agent[],
  agentId: string,
): Agent | undefined {
  return agentList.find((a) => a.id === agentId);
}

export function formatAgentDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLastActivity(timestamp: number | null): string {
  if (!timestamp) return "No activity";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
