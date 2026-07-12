import { create } from "zustand";

import type { CallDetail, CallOutcome } from "@/lib/call-detail-data";

type InternalNote = CallDetail["internalNotes"][number];
type ReactivationState = CallDetail["reactivation"];

type CallDetailStore = {
  callId: string | null;
  isLoading: boolean;
  error: string | null;
  outcome: CallOutcome | null;
  internalNotes: InternalNote[];
  reactivation: ReactivationState;
  hydrate: (detail: CallDetail) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  setOutcome: (outcome: CallOutcome) => void;
  addNote: (author: string, content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  setReactivationEnabled: (enabled: boolean) => void;
  setReactivationCampaign: (campaignId: string) => void;
  setReactivationTimeline: (timeline: string) => void;
  setReactivationNotes: (notes: string) => void;
};

const initialReactivation: ReactivationState = {
  enabled: false,
  campaignId: undefined,
  timeline: undefined,
  notes: undefined,
};

export const useCallDetailStore = create<CallDetailStore>((set) => ({
  callId: null,
  isLoading: true,
  error: null,
  outcome: null,
  internalNotes: [],
  reactivation: initialReactivation,

  hydrate: (detail) =>
    set({
      callId: detail.id,
      isLoading: false,
      error: null,
      outcome: detail.outcome,
      internalNotes: detail.internalNotes,
      reactivation: { ...detail.reactivation },
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () =>
    set({
      callId: null,
      isLoading: true,
      error: null,
      outcome: null,
      internalNotes: [],
      reactivation: initialReactivation,
    }),

  setOutcome: (outcome) => set({ outcome }),

  addNote: (author, content) =>
    set((state) => {
      const now = Date.now();
      const note: InternalNote = {
        id: `note-${now}`,
        author,
        content,
        createdAt: now,
        updatedAt: now,
      };
      return { internalNotes: [note, ...state.internalNotes] };
    }),

  updateNote: (id, content) =>
    set((state) => ({
      internalNotes: state.internalNotes.map((note) =>
        note.id === id ? { ...note, content, updatedAt: Date.now() } : note,
      ),
    })),

  deleteNote: (id) =>
    set((state) => ({
      internalNotes: state.internalNotes.filter((note) => note.id !== id),
    })),

  setReactivationEnabled: (enabled) =>
    set((state) => ({
      reactivation: {
        ...state.reactivation,
        enabled,
        ...(enabled
          ? {}
          : { campaignId: undefined, timeline: undefined, notes: undefined }),
      },
    })),

  setReactivationCampaign: (campaignId) =>
    set((state) => ({
      reactivation: { ...state.reactivation, campaignId },
    })),

  setReactivationTimeline: (timeline) =>
    set((state) => ({
      reactivation: { ...state.reactivation, timeline },
    })),

  setReactivationNotes: (notes) =>
    set((state) => ({
      reactivation: { ...state.reactivation, notes },
    })),
}));
