"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { REVIEWS_PAGE_SIZE } from "@/stores/reviews-store";
import { cn } from "@/lib/utils";

type ReviewsPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, "ellipsis", total];
  }

  if (current >= total - 2) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }

  return [1, "ellipsis", current, "ellipsis", total];
}

export function ReviewsPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: ReviewsPaginationProps) {
  const start =
    totalCount === 0 ? 0 : (currentPage - 1) * REVIEWS_PAGE_SIZE + 1;
  const end = Math.min(currentPage * REVIEWS_PAGE_SIZE, totalCount);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-4 border-t border-propnex-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-propnex-muted">
        {totalCount === 0
          ? "Showing 0 reviews"
          : `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${totalCount.toLocaleString()} reviews`}
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

        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm text-propnex-muted"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                page === currentPage
                  ? "border-propnex-accent bg-propnex-accent text-propnex-bg"
                  : "border-propnex-border bg-propnex-bg text-foreground hover:border-propnex-accent/50",
              )}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}

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
