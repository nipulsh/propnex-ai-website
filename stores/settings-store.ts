import { create } from "zustand";

type SettingsViewer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  company: {
    id: string;
    name: string;
    slug: string;
    contact: {
      name: string;
      email: string;
      phone: string | null;
      title: string | null;
    } | null;
  };
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
  updateCompanyContact: (
    contact: NonNullable<SettingsViewer["company"]["contact"]>,
  ) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  viewer: null,
  integrations: [],
  setViewer: (viewer) => set({ viewer }),
  setIntegrations: (integrations) => set({ integrations }),
  updateCompanyContact: (contact) =>
    set((state) =>
      state.viewer
        ? {
            viewer: {
              ...state.viewer,
              company: { ...state.viewer.company, contact },
            },
          }
        : {},
    ),
}));
