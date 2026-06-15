"use client";

import { Calendar, CheckCircle2, Headset } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import { agents } from "@/lib/agents-data";
import {
  DATE_RANGE_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/call-logs-data";
import { useCallLogsStore } from "@/stores/call-logs-store";

const agentOptions = [
  { value: "all", label: "All Agents" },
  ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
];

export function CallLogsFilters() {
  const dateRange = useCallLogsStore((state) => state.dateRange);
  const agentId = useCallLogsStore((state) => state.agentId);
  const status = useCallLogsStore((state) => state.status);
  const setDateRange = useCallLogsStore((state) => state.setDateRange);
  const setAgentId = useCallLogsStore((state) => state.setAgentId);
  const setStatus = useCallLogsStore((state) => state.setStatus);

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
      </div>
    </section>
  );
}
