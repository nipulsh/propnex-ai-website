import { create } from "zustand";

import type { AgentEnvironment } from "@/lib/agents-data";

export type DeployWizardState = {
  agentName: string;
  voiceId: string;
  phoneNumberId: string | null;
  variables: Record<string, string>;
  environment: AgentEnvironment;
};

type AgentDeployStore = {
  templateId: string | null;
  currentStep: number;
  config: DeployWizardState;
  setTemplateId: (id: string) => void;
  setStep: (step: number) => void;
  updateConfig: (patch: Partial<DeployWizardState>) => void;
  setVariable: (key: string, value: string) => void;
  reset: () => void;
};

const defaultConfig: DeployWizardState = {
  agentName: "",
  voiceId: "",
  phoneNumberId: null,
  variables: {},
  environment: "production",
};

export const useAgentDeployStore = create<AgentDeployStore>((set) => ({
  templateId: null,
  currentStep: 1,
  config: defaultConfig,

  setTemplateId: (id) => set({ templateId: id, currentStep: 1, config: defaultConfig }),

  setStep: (step) => set({ currentStep: Math.max(1, Math.min(5, step)) }),

  updateConfig: (patch) =>
    set((state) => ({ config: { ...state.config, ...patch } })),

  setVariable: (key, value) =>
    set((state) => ({
      config: {
        ...state.config,
        variables: { ...state.config.variables, [key]: value },
      },
    })),

  reset: () =>
    set({ templateId: null, currentStep: 1, config: defaultConfig }),
}));
