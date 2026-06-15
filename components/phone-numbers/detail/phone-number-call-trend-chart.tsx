import { cn } from "@/lib/utils";

type TrendPoint = {
  label: string;
  inbound: number;
  outbound: number;
};

type PhoneNumberCallTrendChartProps = {
  trend: TrendPoint[];
  className?: string;
};

export function PhoneNumberCallTrendChart({
  trend,
  className,
}: PhoneNumberCallTrendChartProps) {
  if (trend.length < 2) return null;

  const width = 400;
  const height = 140;
  const padding = 24;
  const maxValue = Math.max(
    ...trend.flatMap((p) => [p.inbound, p.outbound]),
    1,
  );

  const toY = (value: number) =>
    padding + (1 - value / maxValue) * (height - padding * 2);

  const inboundPoints = trend.map((point, i) => {
    const x =
      padding + (i / (trend.length - 1)) * (width - padding * 2);
    return { x, y: toY(point.inbound) };
  });

  const outboundPoints = trend.map((point, i) => {
    const x =
      padding + (i / (trend.length - 1)) * (width - padding * 2);
    return { x, y: toY(point.outbound) };
  });

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const inboundArea = `${toPath(inboundPoints)} L ${inboundPoints[inboundPoints.length - 1]!.x} ${height - padding} L ${inboundPoints[0]!.x} ${height - padding} Z`;
  const outboundArea = `${toPath(outboundPoints)} L ${outboundPoints[outboundPoints.length - 1]!.x} ${height - padding} L ${outboundPoints[0]!.x} ${height - padding} Z`;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-center gap-4 text-xs text-propnex-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-propnex-accent" />
          Inbound
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-cyan-400" />
          Outbound
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        aria-label="Weekly call activity trend"
      >
        <path d={inboundArea} fill="var(--propnex-accent)" fillOpacity="0.12" />
        <path d={outboundArea} fill="#22d3ee" fillOpacity="0.08" />
        <path
          d={toPath(inboundPoints)}
          fill="none"
          stroke="var(--propnex-accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={toPath(outboundPoints)}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {trend.map((point, i) => {
          const x =
            padding + (i / (trend.length - 1)) * (width - padding * 2);
          return (
            <text
              key={point.label}
              x={x}
              y={height - 6}
              textAnchor="middle"
              className="fill-propnex-muted text-[10px]"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
