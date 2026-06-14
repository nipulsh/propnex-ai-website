import { billingSummary } from "@/lib/billing-data";
import { cn } from "@/lib/utils";

function CreditsRing({ percent }: { percent: number }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex size-44 items-center justify-center">
      <svg
        className="size-full -rotate-90"
        viewBox="0 0 160 160"
        aria-hidden
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="color-mix(in srgb, var(--propnex-muted) 25%, var(--propnex-panel))"
          strokeWidth="10"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--propnex-accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {percent}%
        </span>
        <span className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
          Available
        </span>
      </div>
    </div>
  );
}

export function CreditsUsageCard() {
  const usagePercent =
    (billingSummary.usedCredits / billingSummary.totalCredits) * 100;

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
        <CreditsRing percent={billingSummary.availablePercent} />

        <div className="flex-1 text-center sm:text-left">
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {billingSummary.remainingCredits.toLocaleString()}{" "}
            <span className="text-lg font-medium text-propnex-muted">
              Credits
            </span>
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-propnex-muted">
            Total remaining credits for this billing cycle. Resets on{" "}
            {billingSummary.resetDate}.
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-propnex-border pt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-propnex-muted">Monthly Usage</span>
          <span className="font-medium text-foreground">
            {billingSummary.usedCredits.toLocaleString()} /{" "}
            {billingSummary.totalCredits.toLocaleString()}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--propnex-muted)_20%,var(--propnex-panel))]">
          <div
            className={cn(
              "h-full rounded-full bg-propnex-accent transition-all duration-700",
            )}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
