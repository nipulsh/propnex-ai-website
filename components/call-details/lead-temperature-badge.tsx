import type { LeadTemperature } from "@/lib/call-detail-data";
import { LEAD_TEMPERATURE_STYLES } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type LeadTemperatureBadgeProps = {
  temperature: LeadTemperature;
  className?: string;
};

export function LeadTemperatureBadge({
  temperature,
  className,
}: LeadTemperatureBadgeProps) {
  const { label, className: style } = LEAD_TEMPERATURE_STYLES[temperature];
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
