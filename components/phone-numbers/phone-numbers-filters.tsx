"use client";

import { Headset, Tag } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import { agents } from "@/lib/agents-data";
import { LABEL_OPTIONS, type LabelFilter } from "@/lib/phone-numbers-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

const agentOptions = [
  { value: "all", label: "All Agents" },
  ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
];

export function PhoneNumbersFilters() {
  const agentId = usePhoneNumbersStore((state) => state.agentId);
  const label = usePhoneNumbersStore((state) => state.label);
  const setAgentId = usePhoneNumbersStore((state) => state.setAgentId);
  const setLabel = usePhoneNumbersStore((state) => state.setLabel);

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FilterSelectField
          id="phone-numbers-agent"
          label="Agent"
          icon={Headset}
          value={agentId}
          onChange={setAgentId}
          options={agentOptions}
        />

        <FilterSelectField
          id="phone-numbers-label"
          label="Label"
          icon={Tag}
          value={label}
          onChange={(value) => setLabel(value as LabelFilter)}
          options={LABEL_OPTIONS}
        />
      </div>
    </section>
  );
}
