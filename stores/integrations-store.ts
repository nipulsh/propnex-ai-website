import { create } from "zustand";

import type {
  CalendarOption,
  GoogleCalendarConfig,
  GoogleSheetsConfig,
  IntegrationId,
  SpreadsheetOption,
  SyncHistoryEntry,
  WorksheetOption,
  WorkspaceIntegration,
} from "@/lib/integrations/types";

type Banner = { type: "success" | "error"; message: string };

type IntegrationsStore = {
  integrations: WorkspaceIntegration[];
  spreadsheets: SpreadsheetOption[];
  worksheets: WorksheetOption[];
  calendars: CalendarOption[];
  syncHistory: SyncHistoryEntry[];
  selectedIntegrationId: IntegrationId | null;
  isLoading: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  isSaving: boolean;
  banner: Banner | null;
  fetchIntegrations: () => Promise<void>;
  selectIntegration: (id: IntegrationId | null) => void;
  connectIntegration: (id: IntegrationId) => Promise<void>;
  disconnectIntegration: (id: IntegrationId) => Promise<void>;
  syncSheets: () => Promise<void>;
  fetchSpreadsheets: () => Promise<void>;
  createSpreadsheet: (name: string) => Promise<SpreadsheetOption>;
  fetchWorksheets: (spreadsheetId: string) => Promise<void>;
  saveSheetsConfig: (config: Partial<GoogleSheetsConfig>) => Promise<void>;
  fetchSyncHistory: () => Promise<void>;
  fetchCalendars: () => Promise<void>;
  saveCalendarConfig: (config: Partial<GoogleCalendarConfig>) => Promise<void>;
  clearBanner: () => void;
};

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const useIntegrationsStore = create<IntegrationsStore>((set, get) => ({
  integrations: [],
  spreadsheets: [],
  worksheets: [],
  calendars: [],
  syncHistory: [],
  selectedIntegrationId: null,
  isLoading: false,
  isConnecting: false,
  isSyncing: false,
  isSaving: false,
  banner: null,

  fetchIntegrations: async () => {
    set({ isLoading: true });
    try {
      const data = await parseJson<{ integrations: WorkspaceIntegration[] }>(
        await fetch("/api/integrations"),
      );
      set({ integrations: data.integrations, isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Failed to load integrations",
        },
      });
    }
  },

  selectIntegration: (id) => set({ selectedIntegrationId: id }),

  connectIntegration: async (id) => {
    set({ isConnecting: true, banner: null });
    try {
      const data = await parseJson<{ integration: WorkspaceIntegration }>(
        await fetch(`/api/integrations/${id}/connect`, { method: "POST" }),
      );
      set((s) => ({
        integrations: s.integrations.map((i) =>
          i.id === id ? data.integration : i,
        ),
        isConnecting: false,
        selectedIntegrationId: id,
        banner: { type: "success", message: `${data.integration.name} connected` },
      }));
    } catch (e) {
      set({
        isConnecting: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Connection failed",
        },
      });
    }
  },

  disconnectIntegration: async (id) => {
    set({ isSaving: true, banner: null });
    try {
      const data = await parseJson<{ integration: WorkspaceIntegration }>(
        await fetch(`/api/integrations/${id}/disconnect`, { method: "POST" }),
      );
      set((s) => ({
        integrations: s.integrations.map((i) =>
          i.id === id ? data.integration : i,
        ),
        isSaving: false,
        selectedIntegrationId: null,
        banner: { type: "success", message: "Disconnected successfully" },
      }));
    } catch (e) {
      set({
        isSaving: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Disconnect failed",
        },
      });
    }
  },

  syncSheets: async () => {
    set({ isSyncing: true, banner: null });
    try {
      const data = await parseJson<{ integration: WorkspaceIntegration }>(
        await fetch("/api/integrations/google/sheets/sync", { method: "POST" }),
      );
      set((s) => ({
        integrations: s.integrations.map((i) =>
          i.id === "google-sheets" ? data.integration : i,
        ),
        isSyncing: false,
        banner: { type: "success", message: "Sync completed successfully" },
      }));
      await get().fetchSyncHistory();
    } catch (e) {
      set({
        isSyncing: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Sync failed",
        },
      });
    }
  },

  fetchSpreadsheets: async () => {
    try {
      const data = await parseJson<{ spreadsheets: SpreadsheetOption[] }>(
        await fetch("/api/integrations/google/sheets/spreadsheets"),
      );
      set({ spreadsheets: data.spreadsheets });
    } catch {
      /* non-critical */
    }
  },

  createSpreadsheet: async (name) => {
    const data = await parseJson<{ spreadsheet: SpreadsheetOption }>(
      await fetch("/api/integrations/google/sheets/spreadsheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    );
    set((s) => ({ spreadsheets: [data.spreadsheet, ...s.spreadsheets] }));
    return data.spreadsheet;
  },

  fetchWorksheets: async (spreadsheetId) => {
    try {
      const data = await parseJson<{ worksheets: WorksheetOption[] }>(
        await fetch(
          `/api/integrations/google/sheets/worksheets?spreadsheetId=${spreadsheetId}`,
        ),
      );
      set({ worksheets: data.worksheets });
    } catch {
      set({ worksheets: [] });
    }
  },

  saveSheetsConfig: async (config) => {
    set({ isSaving: true, banner: null });
    try {
      const data = await parseJson<{ integration: WorkspaceIntegration }>(
        await fetch("/api/integrations/google/sheets/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }),
      );
      set((s) => ({
        integrations: s.integrations.map((i) =>
          i.id === "google-sheets" ? data.integration : i,
        ),
        isSaving: false,
        banner: { type: "success", message: "Sheets configuration saved" },
      }));
    } catch (e) {
      set({
        isSaving: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Save failed",
        },
      });
    }
  },

  fetchSyncHistory: async () => {
    try {
      const data = await parseJson<{ history: SyncHistoryEntry[] }>(
        await fetch("/api/integrations/google/sheets/sync-history"),
      );
      set({ syncHistory: data.history });
    } catch {
      /* non-critical */
    }
  },

  fetchCalendars: async () => {
    try {
      const data = await parseJson<{ calendars: CalendarOption[] }>(
        await fetch("/api/integrations/google/calendar/calendars"),
      );
      set({ calendars: data.calendars });
    } catch {
      /* non-critical */
    }
  },

  saveCalendarConfig: async (config) => {
    set({ isSaving: true, banner: null });
    try {
      const data = await parseJson<{ integration: WorkspaceIntegration }>(
        await fetch("/api/integrations/google/calendar/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }),
      );
      set((s) => ({
        integrations: s.integrations.map((i) =>
          i.id === "google-calendar" ? data.integration : i,
        ),
        isSaving: false,
        banner: { type: "success", message: "Calendar configuration saved" },
      }));
    } catch (e) {
      set({
        isSaving: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Save failed",
        },
      });
    }
  },

  clearBanner: () => set({ banner: null }),
}));
