"use client";

import { Bot, Layers, ToggleLeft } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import {
  AGENT_CATEGORY_FILTER_OPTIONS,
  AGENT_STATUS_FILTER_OPTIONS,
  AGENT_TYPE_FILTER_OPTIONS,
} from "@/lib/agents-data";
import { useAgentsStore } from "@/stores/agents-store";

export function AgentsFilters() {
  const statusFilter = useAgentsStore((s) => s.statusFilter);
  const categoryFilter = useAgentsStore((s) => s.categoryFilter);
  const typeFilter = useAgentsStore((s) => s.typeFilter);
  const setStatusFilter = useAgentsStore((s) => s.setStatusFilter);
  const setCategoryFilter = useAgentsStore((s) => s.setCategoryFilter);
  const setTypeFilter = useAgentsStore((s) => s.setTypeFilter);

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <FilterSelectField
          id="agent-status-filter"
          label="Status"
          icon={ToggleLeft}
          value={statusFilter}
          options={AGENT_STATUS_FILTER_OPTIONS}
          onChange={(v) => setStatusFilter(v as typeof statusFilter)}
        />
        <FilterSelectField
          id="agent-category-filter"
          label="Category"
          icon={Layers}
          value={categoryFilter}
          options={AGENT_CATEGORY_FILTER_OPTIONS}
          onChange={(v) => setCategoryFilter(v)}
        />
        <FilterSelectField
          id="agent-type-filter"
          label="Type"
          icon={Bot}
          value={typeFilter}
          options={AGENT_TYPE_FILTER_OPTIONS}
          onChange={(v) => setTypeFilter(v as typeof typeFilter)}
        />
      </div>
    </section>
  );
}
