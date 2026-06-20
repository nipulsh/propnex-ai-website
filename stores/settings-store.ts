import { create } from "zustand";

type SettingsViewer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  company: { id: string; name: string; slug: string };
};

type SettingsIntegration = {
  id: string;
  type: string;
  status: string;
  connectedAccount: string | null;
  lastSyncAt: string | null;
};

type SettingsStore = {
  viewer: SettingsViewer | null;
  integrations: SettingsIntegration[];
  setViewer: (viewer: SettingsViewer) => void;
  setIntegrations: (integrations: SettingsIntegration[]) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  viewer: null,
  integrations: [],
  setViewer: (viewer) => set({ viewer }),
  setIntegrations: (integrations) => set({ integrations }),
}));
