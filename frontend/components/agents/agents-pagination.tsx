"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AGENTS_PAGE_SIZE } from "@/stores/agents-store";

type AgentsPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function AgentsPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: AgentsPaginationProps) {
  const start =
    totalCount === 0 ? 0 : (currentPage - 1) * AGENTS_PAGE_SIZE + 1;
  const end = Math.min(currentPage * AGENTS_PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-col gap-4 border-t border-propnex-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-propnex-muted">
        {totalCount === 0
          ? "Showing 0 of 0 agents"
          : `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${totalCount.toLocaleString()} agents`}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border-propnex-border bg-propnex-bg text-foreground"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="border-propnex-border bg-propnex-bg text-foreground"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
