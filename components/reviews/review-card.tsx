import { Star } from "lucide-react";

import type { CallReview } from "@/lib/reviews-data";
import { BADGE_LABELS, formatReviewDate } from "@/lib/reviews-data";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            size === "sm" ? "size-3" : "size-3.5",
            index < rating
              ? "fill-propnex-accent text-propnex-accent"
              : "fill-transparent text-propnex-border",
          )}
        />
      ))}
    </div>
  );
}

type ReviewCardProps = {
  review: CallReview;
  compact?: boolean;
};

export function ReviewCard({ review, compact = false }: ReviewCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-propnex-border bg-propnex-panel p-5",
        compact && "p-4",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-propnex-accent/15 text-sm font-semibold text-propnex-accent">
            {review.initials}
          </div>
          <div>
            <p className="font-medium text-foreground">{review.reviewerName}</p>
            <p className="text-[0.65rem] font-medium tracking-[0.1em] text-propnex-muted uppercase">
              {BADGE_LABELS[review.badge]}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      <footer className="mt-4 flex items-center justify-between gap-2 border-t border-propnex-border pt-3">
        <span className="text-[0.65rem] font-medium tracking-[0.08em] text-propnex-accent uppercase">
          {review.agentName}
        </span>
        <time
          dateTime={new Date(review.timestamp).toISOString()}
          className="text-xs text-propnex-muted"
        >
          {formatReviewDate(review.timestamp)}
        </time>
      </footer>
    </article>
  );
}
