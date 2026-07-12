"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Library, Loader2 } from "lucide-react";

import { AgentCard } from "@/components/agents/agent-card";
import { AgentsEmptyState } from "@/components/agents/agents-empty-state";
import { AgentsFilters } from "@/components/agents/agents-filters";
import { AgentsPagination } from "@/components/agents/agents-pagination";
import { AgentsStats } from "@/components/agents/agents-stats";
import { AgentsToolbar } from "@/components/agents/agents-toolbar";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { filterAgents } from "@/lib/agents-data";
import { useAgentsGraphQL } from "@/hooks/use-agents-graphql";
import { usePageStatusNotification } from "@/hooks/use-page-status-notification";
import {
  AGENTS_PAGE_SIZE,
  useAgentsStore,
} from "@/stores/agents-store";

export function AgentsPageContent() {
  useAgentsGraphQL();
  const agents = useAgentsStore((s) => s.agents);
  const isLoading = useAgentsStore((s) => s.isLoading);
  const error = useAgentsStore((s) => s.error);
  const searchQuery = useAgentsStore((s) => s.searchQuery);
  const statusFilter = useAgentsStore((s) => s.statusFilter);
  const categoryFilter = useAgentsStore((s) => s.categoryFilter);
  const typeFilter = useAgentsStore((s) => s.typeFilter);
  const branchFilter = useAgentsStore((s) => s.branchFilter);
  const showFilters = useAgentsStore((s) => s.showFilters);
  const page = useAgentsStore((s) => s.currentPage);
  const setPage = useAgentsStore((s) => s.setPage);

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading agents…",
    loadingId: "agents-loading",
    error: error ?? undefined,
    onErrorClear: () => useAgentsStore.setState({ error: null }),
  });

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    typeFilter !== "all" ||
    branchFilter !== "all";

  const { pageAgents, totalPages, totalCount } = useMemo(() => {
    const filtered = filterAgents(
      agents,
      searchQuery,
      statusFilter,
      categoryFilter,
      typeFilter,
      branchFilter,
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
    branchFilter,
    page,
  ]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            title="Agents"
            description="Manage your AI calling agents, track leads, and preview voice demos."
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
          </div>
        </div>

        <AgentsToolbar />
      </div>

      {showFilters ? <AgentsFilters /> : null}

      <AgentsStats />

      <div className="rounded-xl border border-propnex-border bg-propnex-panel">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-propnex-muted" />
          </div>
        ) : pageAgents.length === 0 ? (
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
