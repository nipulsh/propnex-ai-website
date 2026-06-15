import { cn } from "@/lib/utils";

export type BarChartItem = {
  label: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  items: BarChartItem[];
  className?: string;
  ariaLabel?: string;
  horizontal?: boolean;
};

export function BarChart({
  items,
  className,
  ariaLabel = "Bar chart",
  horizontal = false,
}: BarChartProps) {
  if (items.length === 0) return null;

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  if (horizontal) {
    return (
      <div className={cn("space-y-3", className)} aria-label={ariaLabel}>
        {items.map((item) => {
          const percent = (item.value / maxValue) * 100;
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-propnex-muted">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--propnex-muted)_20%,var(--propnex-panel))]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: item.color ?? "var(--propnex-accent)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const width = 400;
  const height = 160;
  const padding = 28;
  const barGap = 8;
  const barWidth =
    (width - padding * 2 - barGap * (items.length - 1)) / items.length;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        aria-label={ariaLabel}
      >
        {items.map((item, i) => {
          const barHeight =
            (item.value / maxValue) * (height - padding * 2);
          const x = padding + i * (barWidth + barGap);
          const y = height - padding - barHeight;

          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={item.color ?? "var(--propnex-accent)"}
                fillOpacity={0.85}
              />
              <text
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                className="fill-propnex-muted text-[10px]"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
