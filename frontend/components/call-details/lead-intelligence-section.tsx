import { LeadTemperatureBadge } from "@/components/call-details/lead-temperature-badge";
import { DetailSection } from "@/components/call-details/detail-section";
import type { CallDetail } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type LeadIntelligenceSectionProps = {
  detail: Pick<
    CallDetail,
    "leadScore" | "leadTemperature" | "conversionProbability" | "interestLevel"
  >;
};

function ScoreRing({ score }: { score: number }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex size-36 items-center justify-center">
      <svg
        className="size-full -rotate-90"
        viewBox="0 0 128 128"
        aria-hidden
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="color-mix(in srgb, var(--propnex-muted) 25%, var(--propnex-panel))"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--propnex-accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{score}</span>
        <span className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
          Score
        </span>
      </div>
    </div>
  );
}

const interestStyles: Record<CallDetail["interestLevel"], string> = {
  high: "text-success",
  medium: "text-orange-400",
  low: "text-propnex-muted",
};

export function LeadIntelligenceSection({ detail }: LeadIntelligenceSectionProps) {
  return (
    <DetailSection
      title="Lead Intelligence"
      description="AI-powered lead scoring and classification."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
        <div className="flex flex-col items-center gap-8 sm:flex-row">
          <ScoreRing score={detail.leadScore} />

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4 text-center">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Classification
              </p>
              <div className="mt-2 flex justify-center">
                <LeadTemperatureBadge temperature={detail.leadTemperature} />
              </div>
            </div>
            <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4 text-center">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Conversion Probability
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {detail.conversionProbability}%
              </p>
            </div>
            <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4 text-center">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Interest Level
              </p>
              <p
                className={cn(
                  "mt-2 text-2xl font-bold capitalize",
                  interestStyles[detail.interestLevel],
                )}
              >
                {detail.interestLevel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DetailSection>
  );
}
