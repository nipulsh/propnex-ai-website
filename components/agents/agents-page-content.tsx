"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Library, Plus } from "lucide-react";

import { AgentCard } from "@/components/agents/agent-card";
import { AgentsEmptyState } from "@/components/agents/agents-empty-state";
import { AgentsFilters } from "@/components/agents/agents-filters";
import { AgentsPagination } from "@/components/agents/agents-pagination";
import { AgentsStats } from "@/components/agents/agents-stats";
import { AgentsToolbar } from "@/components/agents/agents-toolbar";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { filterAgents } from "@/lib/agents-data";
import {
  AGENTS_PAGE_SIZE,
  useAgentsStore,
} from "@/stores/agents-store";

export function AgentsPageContent() {
  const agents = useAgentsStore((s) => s.agents);
  const searchQuery = useAgentsStore((s) => s.searchQuery);
  const statusFilter = useAgentsStore((s) => s.statusFilter);
  const categoryFilter = useAgentsStore((s) => s.categoryFilter);
  const typeFilter = useAgentsStore((s) => s.typeFilter);
  const showFilters = useAgentsStore((s) => s.showFilters);
  const page = useAgentsStore((s) => s.currentPage);
  const setPage = useAgentsStore((s) => s.setPage);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    typeFilter !== "all";

  const { pageAgents, totalPages, totalCount } = useMemo(() => {
    const filtered = filterAgents(
      agents,
      searchQuery,
      statusFilter,
      categoryFilter,
      typeFilter,
    );
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / AGENTS_PAGE_SIZE));
    const safePage = Math.min(page, pages);
    const start = (safePage - 1) * AGENTS_PAGE_SIZE;

    return {
      pageAgents: filtered.slice(start, start + AGENTS_PAGE_SIZE),
      totalPages: pages,
      totalCount: total,
    };
  }, [
    agents,
    searchQuery,
    statusFilter,
    categoryFilter,
    typeFilter,
    page,
  ]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            title="Agents"
            description="Manage, monitor, deploy, and configure all AI voice agents in your workspace."
          />
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/agents/library" />}
              variant="outline"
              className="h-9 gap-2 border-propnex-border bg-propnex-panel px-4"
            >
              <Library className="size-4" />
              Agent Library
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/agents/create" />}
              className="h-9 gap-2 shadow-[0_0_20px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]"
            >
              <Plus className="size-4" />
              Create Agent
            </Button>
          </div>
        </div>

        <AgentsToolbar />
      </div>

      {showFilters ? <AgentsFilters /> : null}

      <AgentsStats />

      <div className="rounded-xl border border-propnex-border bg-propnex-panel">
        {pageAgents.length === 0 ? (
          <AgentsEmptyState hasFilters={hasActiveFilters} />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2 2xl:grid-cols-3">
            {pageAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
        <AgentsPagination
          currentPage={Math.min(page, totalPages)}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
