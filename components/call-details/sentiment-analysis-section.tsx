import { DetailSection } from "@/components/call-details/detail-section";
import { SentimentTrendChart } from "@/components/call-details/sentiment-trend-chart";
import type { CallDetail } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type SentimentAnalysisSectionProps = {
  sentiment: CallDetail["sentiment"];
};

export function SentimentAnalysisSection({
  sentiment,
}: SentimentAnalysisSectionProps) {
  return (
    <DetailSection
      title="Sentiment Analysis"
      description="Emotional tone distribution across the conversation."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
        <div className="mb-6">
          <div className="flex h-3 overflow-hidden rounded-full">
            <div
              className="bg-success transition-all"
              style={{ width: `${sentiment.positive}%` }}
              title={`Positive ${sentiment.positive}%`}
            />
            <div
              className="bg-propnex-muted/40 transition-all"
              style={{ width: `${sentiment.neutral}%` }}
              title={`Neutral ${sentiment.neutral}%`}
            />
            <div
              className="bg-destructive transition-all"
              style={{ width: `${sentiment.negative}%` }}
              title={`Negative ${sentiment.negative}%`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-success" />
              <span className="text-propnex-muted">Positive</span>
              <span className="font-medium text-foreground">
                {sentiment.positive}%
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-propnex-muted/40" />
              <span className="text-propnex-muted">Neutral</span>
              <span className="font-medium text-foreground">
                {sentiment.neutral}%
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-destructive" />
              <span className="text-propnex-muted">Negative</span>
              <span className="font-medium text-foreground">
                {sentiment.negative}%
              </span>
            </span>
          </div>
        </div>

        <div>
          <p
            className={cn(
              "mb-3 text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase",
            )}
          >
            Sentiment Trend
          </p>
          <SentimentTrendChart trend={sentiment.trend} />
        </div>
      </div>
    </DetailSection>
  );
}
