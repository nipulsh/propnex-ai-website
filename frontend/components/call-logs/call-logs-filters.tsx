"use client";

import { Calendar, CheckCircle2, Headset, Thermometer } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import {
  DATE_RANGE_OPTIONS,
  LEAD_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/call-logs-data";
import { useAgentsStore } from "@/stores/agents-store";
import { useCallLogsStore } from "@/stores/call-logs-store";

export function CallLogsFilters() {
  const agents = useAgentsStore((state) => state.agents);
  const agentOptions = [
    { value: "all", label: "All Agents" },
    ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
  ];
  const dateRange = useCallLogsStore((state) => state.dateRange);
  const agentId = useCallLogsStore((state) => state.agentId);
  const status = useCallLogsStore((state) => state.status);
  const leadType = useCallLogsStore((state) => state.leadType);
  const setDateRange = useCallLogsStore((state) => state.setDateRange);
  const setAgentId = useCallLogsStore((state) => state.setAgentId);
  const setStatus = useCallLogsStore((state) => state.setStatus);
  const setLeadType = useCallLogsStore((state) => state.setLeadType);

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelectField
          id="call-logs-date-range"
          label="Date Range"
          icon={Calendar}
          value={dateRange}
          onChange={(value) => setDateRange(value as typeof dateRange)}
          options={DATE_RANGE_OPTIONS}
        />

        <FilterSelectField
          id="call-logs-agent"
          label="Agent"
          icon={Headset}
          value={agentId}
          onChange={setAgentId}
          options={agentOptions}
        />

        <FilterSelectField
          id="call-logs-status"
          label="Status"
          icon={CheckCircle2}
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={STATUS_OPTIONS}
        />

        <FilterSelectField
          id="call-logs-lead-type"
          label="Lead Type"
          icon={Thermometer}
          value={leadType}
          onChange={(value) => setLeadType(value as typeof leadType)}
          options={LEAD_TYPE_OPTIONS}
        />
      </div>
    </section>
  );
}
