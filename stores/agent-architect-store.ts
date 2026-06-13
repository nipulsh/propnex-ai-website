import { create } from "zustand";

import {
  type AgentCardData,
  AGENT_CATEGORIES,
  ACCENT_OPTIONS,
} from "@/lib/agents-data";

export type VoiceGender = "M" | "F" | "N";

export type AgentArchitectConfig = {
  agentName: string;
  category: string;
  languages: string[];
  voiceGender: VoiceGender;
  accent: string;
  personalityPrompt: string;
  avatarGradient: string;
};

const defaultConfig: AgentArchitectConfig = {
  agentName: "",
  category: AGENT_CATEGORIES[0],
  languages: [],
  voiceGender: "M",
  accent: ACCENT_OPTIONS[0],
  personalityPrompt: "",
  avatarGradient:
    "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
};

function voiceGenderFromProfile(profile: string): VoiceGender {
  const lower = profile.toLowerCase();
  if (lower.includes("female")) return "F";
  if (lower.includes("neutral")) return "N";
  return "M";
}

function agentToConfig(agent: AgentCardData): AgentArchitectConfig {
  return {
    agentName: agent.name,
    category: agent.role,
    languages: [...agent.languages],
    voiceGender: voiceGenderFromProfile(agent.voiceProfile),
    accent: ACCENT_OPTIONS[0],
    personalityPrompt: "",
    avatarGradient: agent.avatarGradient,
  };
}

type AgentArchitectStore = {
  isOpen: boolean;
  selectedAgentId: string | null;
  config: AgentArchitectConfig;
  openForAgent: (agent: AgentCardData) => void;
  openNew: () => void;
  close: () => void;
  updateConfig: (updates: Partial<AgentArchitectConfig>) => void;
  addLanguage: (language: string) => void;
  removeLanguage: (language: string) => void;
};

export const useAgentArchitectStore = create<AgentArchitectStore>((set) => ({
  isOpen: false,
  selectedAgentId: null,
  config: defaultConfig,

  openForAgent: (agent) =>
    set({
      isOpen: true,
      selectedAgentId: agent.id,
      config: agentToConfig(agent),
    }),

  openNew: () =>
    set({
      isOpen: true,
      selectedAgentId: null,
      config: {
        ...defaultConfig,
        agentName: "New Agent",
        languages: ["English (US)"],
      },
    }),

  close: () =>
    set({
      isOpen: false,
      selectedAgentId: null,
    }),

  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),

  addLanguage: (language) =>
    set((state) => {
      const trimmed = language.trim();
      if (!trimmed || state.config.languages.includes(trimmed)) {
        return state;
      }
      return {
        config: {
          ...state.config,
          languages: [...state.config.languages, trimmed],
        },
      };
    }),

  removeLanguage: (language) =>
    set((state) => ({
      config: {
        ...state.config,
        languages: state.config.languages.filter((item) => item !== language),
      },
    })),
}));
