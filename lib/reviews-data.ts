import { agents } from "@/lib/agents-data";

export type ReviewBadge = "verified-user" | "enterprise-lead" | "beta-tester";

export type CallReview = {
  id: string;
  reviewerName: string;
  initials: string;
  badge: ReviewBadge;
  rating: number;
  text: string;
  agentId: string;
  agentName: string;
  timestamp: number;
};

export type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

export type DateSortOption = "newest" | "oldest";

export const RATING_FILTER_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
];

export const DATE_SORT_OPTIONS: { value: DateSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export const BADGE_LABELS: Record<ReviewBadge, string> = {
  "verified-user": "Verified User",
  "enterprise-lead": "Enterprise Lead",
  "beta-tester": "Beta Tester",
};

const REVIEW_TEXTS = [
  "The latency on this agent is virtually non-existent. Our customers can't tell they're speaking with AI. A game changer for our support queue.",
  "Setup was incredibly intuitive. We had our first automated booking flow live in under an hour. The voice quality is top-tier.",
  "The multilingual capabilities are flawless. We expanded to three new regions without hiring a single additional support agent.",
  "Call routing and handoff to human agents works seamlessly. Our team loves the detailed transcripts and sentiment summaries.",
  "Outbound lead qualification has improved our conversion rate by 40%. The agent handles objections better than most junior reps.",
  "Appointment scheduling is now fully automated. No more double bookings or missed follow-ups. Highly recommend.",
  "The analytics dashboard gives us real insights into call performance. We can optimize scripts based on actual conversation data.",
  "Voice naturalness exceeded our expectations. Customers frequently compliment how professional and helpful the agent sounds.",
];

const REVIEWER_NAMES = [
  { name: "James D.", initials: "JD", badge: "verified-user" as const },
  { name: "Maria L.", initials: "ML", badge: "enterprise-lead" as const },
  { name: "Alex K.", initials: "AK", badge: "beta-tester" as const },
  { name: "Sarah M.", initials: "SM", badge: "verified-user" as const },
  { name: "David R.", initials: "DR", badge: "enterprise-lead" as const },
  { name: "Emily T.", initials: "ET", badge: "verified-user" as const },
  { name: "Chris P.", initials: "CP", badge: "beta-tester" as const },
  { name: "Lisa W.", initials: "LW", badge: "verified-user" as const },
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function weightedRating(): number {
  const roll = Math.random();
  if (roll < 0.85) return 5;
  if (roll < 0.97) return 4;
  if (roll < 0.99) return 3;
  if (roll < 0.995) return 2;
  return 1;
}

function generateReviews(count: number): CallReview[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, index) => {
    const agent = randomItem(agents);
    const reviewer = randomItem(REVIEWER_NAMES);
    const daysAgo = Math.floor(Math.random() * 180);
    const timestamp = now - daysAgo * dayMs - index * 41_000;

    return {
      id: `review-${index + 1}`,
      reviewerName: reviewer.name,
      initials: reviewer.initials,
      badge: reviewer.badge,
      rating: weightedRating(),
      text: randomItem(REVIEW_TEXTS),
      agentId: agent.id,
      agentName: agent.name.toUpperCase(),
      timestamp,
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

export const callReviews = generateReviews(96);

export function formatReviewDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export function filterReviews(
  reviews: CallReview[],
  rating: RatingFilter,
  agentId: string,
  dateSort: DateSortOption,
): CallReview[] {
  let filtered = reviews.filter((review) => {
    if (rating !== "all" && review.rating !== Number(rating)) return false;
    if (agentId !== "all" && review.agentId !== agentId) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) =>
    dateSort === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
  );

  return filtered;
}

export type RatingDistribution = {
  average: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  percentages: Record<1 | 2 | 3 | 4 | 5, number>;
};

export function getRatingDistribution(reviews: CallReview[]): RatingDistribution {
  const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, review.rating)) as 1 | 2 | 3 | 4 | 5;
    counts[star] += 1;
  }

  const total = reviews.length || 1;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = reviews.length ? sum / reviews.length : 0;

  const percentages: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: Math.round((counts[1] / total) * 100),
    2: Math.round((counts[2] / total) * 100),
    3: Math.round((counts[3] / total) * 100),
    4: Math.round((counts[4] / total) * 100),
    5: Math.round((counts[5] / total) * 100),
  };

  return { average, counts, percentages };
}
