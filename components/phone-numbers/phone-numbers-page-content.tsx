"use client";

import { useMemo } from "react";
import { Download, Mic } from "lucide-react";

import { AddNumberButton } from "@/components/phone-numbers/add-number-button";
import { ExportPhoneNumbersButton } from "@/components/phone-numbers/export-phone-numbers-button";
import { PageHeader } from "@/components/common/page-header";
import { PhoneNumbersFilters } from "@/components/phone-numbers/phone-numbers-filters";
import { PhoneNumbersPagination } from "@/components/phone-numbers/phone-numbers-pagination";
import { PhoneNumbersStats } from "@/components/phone-numbers/phone-numbers-stats";
import { PhoneNumbersTable } from "@/components/phone-numbers/phone-numbers-table";
import { PhoneNumbersToolbar } from "@/components/phone-numbers/phone-numbers-toolbar";
import { filterPhoneNumbers } from "@/lib/phone-numbers-data";
import {
  PHONE_NUMBERS_PAGE_SIZE,
  usePhoneNumbersStore,
} from "@/stores/phone-numbers-store";

export function PhoneNumbersPageContent() {
  const numbers = usePhoneNumbersStore((state) => state.numbers);
  const searchQuery = usePhoneNumbersStore((state) => state.searchQuery);
  const agentId = usePhoneNumbersStore((state) => state.agentId);
  const label = usePhoneNumbersStore((state) => state.label);
  const showFilters = usePhoneNumbersStore((state) => state.showFilters);
  const currentPage = usePhoneNumbersStore((state) => state.currentPage);
  const setPage = usePhoneNumbersStore((state) => state.setPage);

  const { pageNumbers, totalPages, totalCount, startIndex } = useMemo(() => {
    const filtered = filterPhoneNumbers(numbers, searchQuery, agentId, label);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PHONE_NUMBERS_PAGE_SIZE));
    const safePage = Math.min(currentPage, pages);
    const start = (safePage - 1) * PHONE_NUMBERS_PAGE_SIZE;

    return {
      pageNumbers: filtered.slice(start, start + PHONE_NUMBERS_PAGE_SIZE),
      totalPages: pages,
      totalCount: total,
      startIndex: start,
    };
  }, [numbers, searchQuery, agentId, label, currentPage]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            title="Phone Numbers"
            description="Manage your global telecommunication gateways."
          />
          <div className="flex shrink-0 items-center gap-3">
            <AddNumberButton />
            <ExportPhoneNumbersButton className="h-9 gap-2 border-propnex-border bg-propnex-panel px-4 text-foreground">
              <Download className="size-4" />
              Export
            </ExportPhoneNumbersButton>
          </div>
        </div>

        <PhoneNumbersToolbar />
      </div>

      {showFilters ? <PhoneNumbersFilters /> : null}

      <div className="rounded-xl border border-propnex-border bg-propnex-panel">
        <PhoneNumbersTable numbers={pageNumbers} startIndex={startIndex} />
        <PhoneNumbersPagination
          currentPage={Math.min(currentPage, totalPages)}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </div>

      <PhoneNumbersStats />

      <button
        type="button"
        className="fixed right-6 bottom-6 z-20 flex size-14 items-center justify-center rounded-full bg-propnex-accent text-propnex-bg shadow-[0_0_24px_color-mix(in_srgb,var(--propnex-accent)_45%,transparent)] transition-transform hover:scale-105 md:bottom-8"
        aria-label="Start voice assistant"
      >
        <Mic className="size-6" />
      </button>
    </div>
  );
}
