import type { QualityRating } from "@/lib/call-detail-data";
import { QUALITY_LABELS, QUALITY_STYLES } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type QualityBadgeProps = {
  rating: QualityRating;
  className?: string;
};

export function QualityBadge({ rating, className }: QualityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        QUALITY_STYLES[rating],
        className,
      )}
    >
      {QUALITY_LABELS[rating]}
    </span>
  );
}
