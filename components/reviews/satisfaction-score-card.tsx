import { Star } from "lucide-react";

import type { RatingDistribution } from "@/lib/reviews-data";
import { StarRating } from "@/components/reviews/review-card";

type SatisfactionScoreCardProps = {
  distribution: RatingDistribution;
};

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

export function SatisfactionScoreCard({ distribution }: SatisfactionScoreCardProps) {
  const displayAverage = distribution.average.toFixed(1);

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center gap-2 lg:items-start">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-bold tracking-tight text-foreground">
              {displayAverage}
            </span>
            <StarRating rating={Math.round(distribution.average)} size="md" />
          </div>
          <p className="text-[0.65rem] font-medium tracking-[0.14em] text-propnex-muted uppercase">
            Global Satisfaction Score
          </p>
        </div>

        <div className="flex-1 space-y-2 lg:max-w-md">
          {STAR_LEVELS.map((star) => (
            <div key={star} className="flex items-center gap-3">
              <span className="w-3 text-xs text-propnex-muted">{star}</span>
              <Star className="size-3 fill-propnex-accent text-propnex-accent" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-propnex-bg">
                <div
                  className="h-full rounded-full bg-propnex-accent transition-all"
                  style={{ width: `${distribution.percentages[star]}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-propnex-muted">
                {distribution.percentages[star]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
