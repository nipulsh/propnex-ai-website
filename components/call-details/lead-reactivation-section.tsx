"use client";

import { RefreshCw } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import { DetailSection } from "@/components/call-details/detail-section";
import { Button } from "@/components/ui/button";
import { REACTIVATION_CAMPAIGNS } from "@/lib/call-detail-data";
import { useCallDetailStore } from "@/stores/call-detail-store";
import { cn } from "@/lib/utils";

const TIMELINE_OPTIONS = [
  { value: "3-days", label: "3 Days" },
  { value: "1-week", label: "1 Week" },
  { value: "2-weeks", label: "2 Weeks" },
  { value: "1-month", label: "1 Month" },
];

export function LeadReactivationSection() {
  const reactivation = useCallDetailStore((s) => s.reactivation);
  const setReactivationEnabled = useCallDetailStore(
    (s) => s.setReactivationEnabled,
  );
  const setReactivationCampaign = useCallDetailStore(
    (s) => s.setReactivationCampaign,
  );
  const setReactivationTimeline = useCallDetailStore(
    (s) => s.setReactivationTimeline,
  );
  const setReactivationNotes = useCallDetailStore(
    (s) => s.setReactivationNotes,
  );

  return (
    <DetailSection
      title="Lead Reactivation"
      description="Add this lead to a reactivation campaign."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <p className="mb-3 text-sm font-medium text-foreground">
          Add To Reactivation Plan
        </p>
        <div className="flex gap-2">
          <Button
            variant={reactivation.enabled ? "default" : "outline"}
            size="sm"
            onClick={() => setReactivationEnabled(true)}
            className={cn(
              reactivation.enabled &&
                "shadow-[0_0_16px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]",
            )}
          >
            Yes
          </Button>
          <Button
            variant={!reactivation.enabled ? "default" : "outline"}
            size="sm"
            onClick={() => setReactivationEnabled(false)}
          >
            No
          </Button>
        </div>

        {reactivation.enabled ? (
          <div className="mt-5 space-y-4 border-t border-propnex-border pt-5">
            <FilterSelectField
              id="reactivation-campaign"
              label="Reactivation Campaign"
              icon={RefreshCw}
              value={reactivation.campaignId ?? ""}
              onChange={setReactivationCampaign}
              options={[
                { value: "", label: "Select campaign..." },
                ...REACTIVATION_CAMPAIGNS.map((c) => ({
                  value: c.id,
                  label: c.label,
                })),
              ]}
            />
            <FilterSelectField
              id="reactivation-timeline"
              label="Follow-Up Timeline"
              icon={RefreshCw}
              value={reactivation.timeline ?? ""}
              onChange={setReactivationTimeline}
              options={[
                { value: "", label: "Select timeline..." },
                ...TIMELINE_OPTIONS,
              ]}
            />
            <div className="space-y-2">
              <label
                htmlFor="reactivation-notes"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Notes
              </label>
              <textarea
                id="reactivation-notes"
                value={reactivation.notes ?? ""}
                onChange={(e) => setReactivationNotes(e.target.value)}
                rows={3}
                placeholder="Add reactivation notes..."
                className="w-full resize-none rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
              />
            </div>
          </div>
        ) : null}
      </div>
    </DetailSection>
  );
}
