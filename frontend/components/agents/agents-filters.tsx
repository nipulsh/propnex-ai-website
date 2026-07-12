"use client";

import { useEffect, useState } from "react";
import { Bot, Building2, Layers, ToggleLeft } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import {
  AGENT_CATEGORY_FILTER_OPTIONS,
  AGENT_STATUS_FILTER_OPTIONS,
  AGENT_TYPE_FILTER_OPTIONS,
} from "@/lib/agents-data";
import { fetchBranchesPage } from "@/lib/graphql/api";
import { useAgentsStore } from "@/stores/agents-store";

export function AgentsFilters() {
  const statusFilter = useAgentsStore((s) => s.statusFilter);
  const categoryFilter = useAgentsStore((s) => s.categoryFilter);
  const typeFilter = useAgentsStore((s) => s.typeFilter);
  const branchFilter = useAgentsStore((s) => s.branchFilter);
  const setStatusFilter = useAgentsStore((s) => s.setStatusFilter);
  const setCategoryFilter = useAgentsStore((s) => s.setCategoryFilter);
  const setTypeFilter = useAgentsStore((s) => s.setTypeFilter);
  const setBranchFilter = useAgentsStore((s) => s.setBranchFilter);

  const [branchOptions, setBranchOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "all", label: "All Branches" }]);

  useEffect(() => {
    fetchBranchesPage(100)
      .then((res) =>
        setBranchOptions([
          { value: "all", label: "All Branches" },
          ...res.branches.connection.edges.map((edge) => ({
            value: edge.node.id,
            label: edge.node.name,
          })),
        ]),
      )
      .catch(() => setBranchOptions([{ value: "all", label: "All Branches" }]));
  }, []);

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <FilterSelectField
          id="agent-branch-filter"
          label="Branch"
          icon={Building2}
          value={branchFilter}
          options={branchOptions}
          onChange={(v) => setBranchFilter(v)}
        />
      </div>
    </section>
  );
}
