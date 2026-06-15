import { Sparkles } from "lucide-react";

import type { CallDetail } from "@/lib/call-detail-data";

type CallAiSummaryProps = {
  summary: CallDetail["aiSummary"];
};

export function CallAiSummary({ summary }: CallAiSummaryProps) {
  return (
    <section className="rounded-xl border border-propnex-accent/30 bg-propnex-accent/5 p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-propnex-accent/15">
          <Sparkles className="size-5 text-propnex-accent" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              AI Generated Summary
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {summary.interests}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Discussion Points
              </p>
              <ul className="mt-2 space-y-1.5">
                {summary.discussionPoints.map((point) => (
                  <li
                    key={point}
                    className="text-sm text-foreground before:mr-2 before:text-propnex-accent before:content-['•']"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Key Decisions
              </p>
              <ul className="mt-2 space-y-1.5">
                {summary.decisions.map((decision) => (
                  <li
                    key={decision}
                    className="text-sm text-foreground before:mr-2 before:text-propnex-accent before:content-['•']"
                  >
                    {decision}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Recommended Next Steps
              </p>
              <ul className="mt-2 space-y-1.5">
                {summary.nextSteps.map((step) => (
                  <li
                    key={step}
                    className="text-sm text-foreground before:mr-2 before:text-propnex-accent before:content-['•']"
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
