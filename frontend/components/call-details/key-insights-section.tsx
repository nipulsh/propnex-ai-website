import type { ComponentType } from "react";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Home,
  MapPin,
  Sparkles,
} from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import type { CallDetail } from "@/lib/call-detail-data";

type KeyInsightsSectionProps = {
  insights: CallDetail["keyInsights"];
};

function InsightCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
      <div className="flex items-center gap-2 text-propnex-muted">
        <Icon className="size-4 text-propnex-accent" />
        <span className="text-[0.65rem] font-medium tracking-[0.12em] uppercase">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function TagList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex rounded-md border border-propnex-border bg-propnex-bg px-2.5 py-1 text-xs text-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function KeyInsightsSection({ insights }: KeyInsightsSectionProps) {
  return (
    <DetailSection
      title="Key Insights Extraction"
      description="AI-extracted lead preferences and requirements."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-propnex-accent" />
          <span className="text-sm text-propnex-muted">
            Automatically extracted from conversation
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InsightCard icon={DollarSign} label="Budget" value={insights.budget} />
          <InsightCard
            icon={MapPin}
            label="Preferred Location"
            value={insights.preferredLocation}
          />
          <InsightCard
            icon={Home}
            label="Property Type"
            value={insights.propertyType}
          />
          <InsightCard
            icon={Calendar}
            label="Timeline"
            value={insights.timeline}
          />
        </div>

        <div className="mt-6 space-y-4 border-t border-propnex-border pt-6">
          <TagList label="Main Concerns" items={insights.mainConcerns} />
          <TagList
            label="Special Requirements"
            items={insights.specialRequirements}
          />
          {insights.mainConcerns.length === 0 &&
          insights.specialRequirements.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-propnex-muted">
              <AlertCircle className="size-4" />
              No additional concerns or requirements detected.
            </p>
          ) : null}
        </div>
      </div>
    </DetailSection>
  );
}
