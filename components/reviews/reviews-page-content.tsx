"use client";

import { useMemo } from "react";
import { Mic } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { ReviewAutomationCard } from "@/components/reviews/review-automation-card";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewsFilters } from "@/components/reviews/reviews-filters";
import { ReviewsPagination } from "@/components/reviews/reviews-pagination";
import { SatisfactionScoreCard } from "@/components/reviews/satisfaction-score-card";
import {
  callReviews,
  filterReviews,
  getRatingDistribution,
} from "@/lib/reviews-data";
import { cn } from "@/lib/utils";
import {
  REVIEWS_PAGE_SIZE,
  useReviewsStore,
} from "@/stores/reviews-store";

export function ReviewsPageContent() {
  const rating = useReviewsStore((state) => state.rating);
  const agentId = useReviewsStore((state) => state.agentId);
  const dateSort = useReviewsStore((state) => state.dateSort);
  const viewMode = useReviewsStore((state) => state.viewMode);
  const currentPage = useReviewsStore((state) => state.currentPage);
  const setPage = useReviewsStore((state) => state.setPage);

  const { reviews, totalPages, totalCount, distribution } = useMemo(() => {
    const filtered = filterReviews(callReviews, rating, agentId, dateSort);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE));
    const start = (currentPage - 1) * REVIEWS_PAGE_SIZE;

    return {
      reviews: filtered.slice(start, start + REVIEWS_PAGE_SIZE),
      totalPages: pages,
      totalCount: total,
      distribution: getRatingDistribution(filtered),
    };
  }, [rating, agentId, dateSort, currentPage]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <PageHeader
        title="Reviews"
        description="Browse customer reviews and feedback from calls."
      />

      <SatisfactionScoreCard distribution={distribution} />

      <ReviewsFilters />

      <div className="rounded-xl border border-propnex-border bg-propnex-panel">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <p className="font-medium text-foreground">No reviews found</p>
            <p className="text-sm text-propnex-muted">
              Try adjusting your filters to see more call reviews.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "p-5",
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 md:grid-cols-2"
                : "flex flex-col gap-4",
            )}
          >
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                compact={viewMode === "grid"}
              />
            ))}
          </div>
        )}

        <ReviewsPagination
          currentPage={Math.min(currentPage, totalPages)}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </div>

      <ReviewAutomationCard />

      <button
        type="button"
        className="fixed right-6 bottom-6 z-20 flex size-14 items-center justify-center rounded-full bg-propnex-accent text-propnex-bg shadow-[0_0_24px_color-mix(in_srgb,var(--propnex-accent)_45%,transparent)] transition-transform hover:scale-105 md:bottom-8"
        aria-label="Start voice assistant"
      >
        <Mic className="size-6" />
      </button>
    </div>
  );
}
