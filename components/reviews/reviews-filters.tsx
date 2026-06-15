"use client";

import { ChevronDown, LayoutGrid, List } from "lucide-react";

import { agents } from "@/lib/agents-data";
import {
  DATE_SORT_OPTIONS,
  RATING_FILTER_OPTIONS,
} from "@/lib/reviews-data";
import { useReviewsStore } from "@/stores/reviews-store";
import { cn } from "@/lib/utils";

const agentOptions = [
  { value: "all", label: "All" },
  ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
];

type FilterPillProps = {
  id: string;
  prefix: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

function FilterPill({ id, prefix, value, options, onChange }: FilterPillProps) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-[9.5rem] cursor-pointer appearance-none rounded-full border border-propnex-border bg-propnex-bg py-2 pr-8 pl-4 text-sm text-transparent outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
        aria-label={`${prefix} filter`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-0 flex items-center gap-1.5 px-4 text-sm">
        <span className="text-propnex-muted">{prefix}:</span>
        <span className="font-medium">{selectedLabel}</span>
        <ChevronDown className="ml-auto size-3.5 text-propnex-muted" />
      </span>
    </div>
  );
}

export function ReviewsFilters() {
  const rating = useReviewsStore((state) => state.rating);
  const agentId = useReviewsStore((state) => state.agentId);
  const dateSort = useReviewsStore((state) => state.dateSort);
  const viewMode = useReviewsStore((state) => state.viewMode);
  const setRating = useReviewsStore((state) => state.setRating);
  const setAgentId = useReviewsStore((state) => state.setAgentId);
  const setDateSort = useReviewsStore((state) => state.setDateSort);
  const setViewMode = useReviewsStore((state) => state.setViewMode);

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          id="reviews-rating"
          prefix="Rating"
          value={rating}
          options={RATING_FILTER_OPTIONS}
          onChange={(value) => setRating(value as typeof rating)}
        />
        <FilterPill
          id="reviews-agent"
          prefix="Agent"
          value={agentId}
          options={agentOptions}
          onChange={setAgentId}
        />
        <FilterPill
          id="reviews-date"
          prefix="Date"
          value={dateSort}
          options={DATE_SORT_OPTIONS}
          onChange={(value) => setDateSort(value as typeof dateSort)}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setViewMode("grid")}
          className={cn(
            "flex size-9 items-center justify-center rounded-lg border transition-colors",
            viewMode === "grid"
              ? "border-propnex-accent bg-propnex-accent/15 text-propnex-accent"
              : "border-propnex-border bg-propnex-bg text-propnex-muted hover:text-foreground",
          )}
          aria-label="Grid view"
          aria-pressed={viewMode === "grid"}
        >
          <LayoutGrid className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={cn(
            "flex size-9 items-center justify-center rounded-lg border transition-colors",
            viewMode === "list"
              ? "border-propnex-accent bg-propnex-accent/15 text-propnex-accent"
              : "border-propnex-border bg-propnex-bg text-propnex-muted hover:text-foreground",
          )}
          aria-label="List view"
          aria-pressed={viewMode === "list"}
        >
          <List className="size-4" />
        </button>
      </div>
    </section>
  );
}
