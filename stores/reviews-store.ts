import { create } from "zustand";

import {
  type DateSortOption,
  type RatingFilter,
} from "@/lib/reviews-data";

const PAGE_SIZE = 6;

export type ReviewViewMode = "list" | "grid";

type ReviewsStore = {
  rating: RatingFilter;
  agentId: string;
  dateSort: DateSortOption;
  viewMode: ReviewViewMode;
  currentPage: number;
  setRating: (value: RatingFilter) => void;
  setAgentId: (value: string) => void;
  setDateSort: (value: DateSortOption) => void;
  setViewMode: (value: ReviewViewMode) => void;
  setPage: (page: number) => void;
};

export const useReviewsStore = create<ReviewsStore>((set) => ({
  rating: "all",
  agentId: "all",
  dateSort: "newest",
  viewMode: "list",
  currentPage: 1,

  setRating: (value) => set({ rating: value, currentPage: 1 }),
  setAgentId: (value) => set({ agentId: value, currentPage: 1 }),
  setDateSort: (value) => set({ dateSort: value, currentPage: 1 }),
  setViewMode: (value) => set({ viewMode: value }),
  setPage: (page) => set({ currentPage: Math.max(1, page) }),
}));

export const REVIEWS_PAGE_SIZE = PAGE_SIZE;
