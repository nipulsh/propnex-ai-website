"use client";

import { Filter, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { cn } from "@/lib/utils";

export function PhoneNumbersToolbar() {
  const searchQuery = usePhoneNumbersStore((state) => state.searchQuery);
  const showFilters = usePhoneNumbersStore((state) => state.showFilters);
  const setSearchQuery = usePhoneNumbersStore((state) => state.setSearchQuery);
  const toggleFilters = usePhoneNumbersStore((state) => state.toggleFilters);

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={toggleFilters}
        className={cn(
          "h-11 shrink-0 gap-2 border-propnex-border bg-propnex-panel px-4 text-foreground",
          showFilters && "border-propnex-accent/50",
        )}
      >
        <Filter className="size-4" />
        Filters
      </Button>

      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by number or agent name..."
          className="h-11 w-full border-propnex-border bg-propnex-panel pl-10 text-foreground placeholder:text-propnex-muted focus-visible:border-propnex-accent focus-visible:ring-propnex-accent/30"
        />
      </div>
    </div>
  );
}
