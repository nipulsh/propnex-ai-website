import { ArrowRight, Zap } from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import { Button } from "@/components/ui/button";
import type { CallDetail } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type FollowUpRecommendationsProps = {
  recommendations: CallDetail["followUpRecommendations"];
};

const priorityStyles: Record<
  CallDetail["followUpRecommendations"][number]["priority"],
  string
> = {
  high: "border-destructive/30 bg-destructive/5",
  medium: "border-orange-400/30 bg-orange-400/5",
  low: "border-propnex-border bg-propnex-bg",
};

const priorityLabels: Record<
  CallDetail["followUpRecommendations"][number]["priority"],
  string
> = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

export function FollowUpRecommendations({
  recommendations,
}: FollowUpRecommendationsProps) {
  return (
    <DetailSection
      title="Follow-Up Recommendations"
      description="AI-generated next actions for this lead."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border p-4",
              priorityStyles[rec.priority],
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="size-4 shrink-0 text-propnex-accent" />
                <p className="text-sm font-medium text-foreground">
                  {rec.label}
                </p>
              </div>
              <p className="mt-1 text-xs text-propnex-muted">
                {priorityLabels[rec.priority]}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}
