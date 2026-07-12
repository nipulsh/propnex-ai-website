import { cn } from "@/lib/utils";

export type LineChartSeries = {
  key: string;
  label: string;
  color: string;
  values: number[];
};

type LineChartProps = {
  labels: string[];
  series: LineChartSeries[];
  className?: string;
  ariaLabel?: string;
};

export function LineChart({
  labels,
  series,
  className,
  ariaLabel = "Line chart",
}: LineChartProps) {
  if (labels.length < 2 || series.length === 0) return null;

  const width = 400;
  const height = 160;
  const padding = 28;
  const maxValue = Math.max(
    ...series.flatMap((s) => s.values),
    1,
  );

  const toY = (value: number) =>
    padding + (1 - value / maxValue) * (height - padding * 2);

  const toPath = (values: number[]) =>
    values
      .map((value, i) => {
        const x =
          padding + (i / (values.length - 1)) * (width - padding * 2);
        return `${i === 0 ? "M" : "L"} ${x} ${toY(value)}`;
      })
      .join(" ");

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-propnex-muted">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        aria-label={ariaLabel}
      >
        {series.map((s) => {
          const points = s.values.map((value, i) => ({
            x: padding + (i / (s.values.length - 1)) * (width - padding * 2),
            y: toY(value),
          }));
          const area = `${toPath(s.values)} L ${points[points.length - 1]!.x} ${height - padding} L ${points[0]!.x} ${height - padding} Z`;

          return (
            <g key={s.key}>
              <path d={area} fill={s.color} fillOpacity="0.1" />
              <path
                d={toPath(s.values)}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {labels.map((label, i) => {
          const x =
            padding + (i / (labels.length - 1)) * (width - padding * 2);
          return (
            <text
              key={`${label}-${i}`}
              x={x}
              y={height - 6}
              textAnchor="middle"
              className="fill-propnex-muted text-[10px]"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
