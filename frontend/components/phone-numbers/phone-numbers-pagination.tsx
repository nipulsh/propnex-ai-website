"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PHONE_NUMBERS_PAGE_SIZE } from "@/stores/phone-numbers-store";

type PhoneNumbersPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function PhoneNumbersPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: PhoneNumbersPaginationProps) {
  const end = Math.min(currentPage * PHONE_NUMBERS_PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-col gap-4 border-t border-propnex-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-propnex-muted">
        {totalCount === 0
          ? "Showing 0 of 0 numbers"
          : `Showing ${end.toLocaleString()} of ${totalCount.toLocaleString()} numbers`}
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
