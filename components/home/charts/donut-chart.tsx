import { cn } from "@/lib/utils";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  className?: string;
  size?: number;
};

export function DonutChart({
  segments,
  className,
  size = 160,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  const center = size / 2;
  const radius = size / 2 - 12;
  const innerRadius = radius * 0.62;
  let cumulative = 0;

  const arcs = segments.map((segment) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += segment.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");

    return { ...segment, path, percent: Math.round((segment.value / total) * 100) };
  });

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-label="Distribution chart"
      >
        {arcs.map((arc) => (
          <path key={arc.label} d={arc.path} fill={arc.color} />
        ))}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-lg font-bold"
        >
          {total}
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: arc.color }}
            />
            <span className="text-propnex-muted">{arc.label}</span>
            <span className="font-medium text-foreground">{arc.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
