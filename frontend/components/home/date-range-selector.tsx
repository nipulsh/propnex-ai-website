"use client";

import { Calendar } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import { DATE_RANGE_OPTIONS } from "@/lib/call-logs-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function DateRangeSelector() {
  const dateRange = useHomeDashboardStore((s) => s.dateRange);
  const setDateRange = useHomeDashboardStore((s) => s.setDateRange);

  return (
    <FilterSelectField
      id="home-date-range"
      label="Date Range"
      icon={Calendar}
      value={dateRange}
      onChange={(value) =>
        setDateRange(value as typeof dateRange)
      }
      options={DATE_RANGE_OPTIONS}
      className="w-full sm:w-56"
    />
  );
}
