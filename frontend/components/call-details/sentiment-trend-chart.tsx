import { cn } from "@/lib/utils";

type SentimentTrendChartProps = {
  trend: { atPercent: number; score: number }[];
  className?: string;
};

export function SentimentTrendChart({
  trend,
  className,
}: SentimentTrendChartProps) {
  if (trend.length < 2) return null;

  const width = 400;
  const height = 120;
  const padding = 8;

  const points = trend.map((point) => {
    const x = padding + (point.atPercent / 100) * (width - padding * 2);
    const y =
      padding +
      ((1 - (point.score + 1) / 2) * (height - padding * 2));
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1]!.x} ${height - padding} L ${points[0]!.x} ${height - padding} Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        aria-label="Sentiment trend across call duration"
      >
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="color-mix(in srgb, var(--propnex-muted) 30%, transparent)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path d={areaPath} fill="var(--propnex-accent)" fillOpacity="0.12" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--propnex-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="var(--propnex-accent)"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[0.65rem] text-propnex-muted">
        <span>Start</span>
        <span>Mid-call</span>
        <span>End</span>
      </div>
    </div>
  );
}
