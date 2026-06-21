import { create } from "zustand";

export type ContactPhone = {
  id: string;
  phone: string;
  createdAt: string;
};

export const CONTACT_PHONES_PAGE_SIZE = 25;

type ContactPhonesState = {
  contacts: ContactPhone[];
  selectedIds: string[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  setContacts: (contacts: ContactPhone[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
};

export const useContactPhonesStore = create<ContactPhonesState>((set, get) => ({
  contacts: [],
  selectedIds: [],
  isLoading: true,
  error: null,
  currentPage: 1,
  setContacts: (contacts) => set({ contacts, currentPage: 1 }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPage: (currentPage) => set({ currentPage }),
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
      const allSelected = ids.every((id) => selected.has(id));
      if (allSelected) {
        for (const id of ids) {
          selected.delete(id);
        }
      } else {
        for (const id of ids) {
          selected.add(id);
        }
      }
      return { selectedIds: [...selected] };
    }),
  clearSelection: () => set({ selectedIds: [] }),
  isSelected: (id) => get().selectedIds.includes(id),
}));
