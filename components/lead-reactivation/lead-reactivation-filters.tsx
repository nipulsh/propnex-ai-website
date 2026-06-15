"use client";

import { Clock, Headset, RefreshCw } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import {
  INACTIVITY_OPTIONS,
  LEAD_STATUS_OPTIONS,
} from "@/lib/lead-reactivation-data";
import { useAgentsStore } from "@/stores/agents-store";
import { useLeadReactivationStore } from "@/stores/lead-reactivation-store";

export function LeadReactivationFilters() {
  const agents = useAgentsStore((state) => state.agents);
  const agentOptions = [
    { value: "all", label: "All Agents" },
    ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
  ];
  const status = useLeadReactivationStore((state) => state.status);
  const agentId = useLeadReactivationStore((state) => state.agentId);
  const inactivity = useLeadReactivationStore((state) => state.inactivity);
  const setStatus = useLeadReactivationStore((state) => state.setStatus);
  const setAgentId = useLeadReactivationStore((state) => state.setAgentId);
  const setInactivity = useLeadReactivationStore((state) => state.setInactivity);

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FilterSelectField
          id="lead-reactivation-status"
          label="Status"
          icon={RefreshCw}
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={LEAD_STATUS_OPTIONS}
        />

        <FilterSelectField
          id="lead-reactivation-agent"
          label="Agent"
          icon={Headset}
          value={agentId}
          onChange={setAgentId}
          options={agentOptions}
        />

        <FilterSelectField
          id="lead-reactivation-inactivity"
          label="Inactivity"
          icon={Clock}
          value={inactivity}
          onChange={(value) => setInactivity(value as typeof inactivity)}
          options={INACTIVITY_OPTIONS}
        />
      </div>
    </section>
  );
}
