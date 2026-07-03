import { create } from "zustand";

import type { BranchNode } from "@/lib/graphql/queries";

export const BRANCHES_PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;

type BranchesState = {
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
};

export const useBranchesStore = create<BranchesState>((set, get) => ({
  selectedIds: [],
  toggleSelect: (id) =>
    set((state) => {
      const selected = new Set(state.selectedIds);
      if (selected.has(id)) {
        selected.delete(id);
      } else {
        selected.add(id);
      }
      return { selectedIds: [...selected] };
    }),
  selectAll: (ids) =>
    set((state) => {
      const selected = new Set(state.selectedIds);
      const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
      if (allSelected) {
        for (const id of ids) selected.delete(id);
      } else {
        for (const id of ids) selected.add(id);
      }
      return { selectedIds: [...selected] };
    }),
  setSelection: (ids) => set({ selectedIds: [...new Set(ids)] }),
  clearSelection: () => set({ selectedIds: [] }),
  isSelected: (id) => get().selectedIds.includes(id),
}));

export type { BranchNode };
