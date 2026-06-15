"use client";

import { Target } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import { DetailSection } from "@/components/call-details/detail-section";
import type { CallOutcome } from "@/lib/call-detail-data";
import { formatOutcome, OUTCOME_OPTIONS } from "@/lib/call-detail-data";
import { useCallDetailStore } from "@/stores/call-detail-store";

export function CallOutcomeSection() {
  const outcome = useCallDetailStore((s) => s.outcome);
  const setOutcome = useCallDetailStore((s) => s.setOutcome);

  if (!outcome) return null;

  return (
    <DetailSection
      title="Call Outcome"
      description="View and update the classified outcome for this call."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <FilterSelectField
              id="call-outcome"
              label="Outcome"
              icon={Target}
              value={outcome}
              onChange={(value) => setOutcome(value as CallOutcome)}
              options={OUTCOME_OPTIONS}
            />
          </div>
          <p className="text-sm text-propnex-muted">
            Current:{" "}
            <span className="font-medium text-foreground">
              {formatOutcome(outcome)}
            </span>
          </p>
        </div>
      </div>
    </DetailSection>
  );
}
