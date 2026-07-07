import { create } from "zustand";

import {
  type Agent,
  type AgentCategoryFilter,
  type AgentStatusFilter,
  type AgentTypeFilter,
  createAgentId,
} from "@/lib/agents-data";
import {
  type AgentLibraryTemplate,
  type DeployFromTemplateConfig,
  templateToAgentDefaults,
} from "@/lib/agent-library-data";

export const AGENTS_PAGE_SIZE = 12;

type CreateAgentInput = Omit<Agent, "id" | "createdAt" | "updatedAt"> & {
  name: string;
};

type AgentsStore = {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: AgentStatusFilter;
  categoryFilter: AgentCategoryFilter;
  typeFilter: AgentTypeFilter;
  branchFilter: string;
  showFilters: boolean;
  currentPage: number;
  setAgents: (agents: Agent[]) => void;
  upsertAgent: (agent: Agent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (value: string) => void;
  setStatusFilter: (value: AgentStatusFilter) => void;
  setCategoryFilter: (value: AgentCategoryFilter) => void;
  setTypeFilter: (value: AgentTypeFilter) => void;
  setBranchFilter: (value: string) => void;
  toggleFilters: () => void;
  setPage: (page: number) => void;
  setAgentEnabled: (id: string, enabled: boolean) => void;
  updateAgent: (id: string, patch: Partial<Agent>) => void;
  createAgent: (input: CreateAgentInput) => Agent;
  deployFromTemplate: (
    template: AgentLibraryTemplate,
    config: DeployFromTemplateConfig,
  ) => Agent;
  getAgentById: (id: string) => Agent | undefined;
};

export const useAgentsStore = create<AgentsStore>((set, get) => ({
  agents: [],
  isLoading: true,
  error: null,
  searchQuery: "",
  statusFilter: "all",
  categoryFilter: "all",
  typeFilter: "all",
  branchFilter: "all",
  showFilters: false,
  currentPage: 1,

  setAgents: (agents) => set({ agents }),
  upsertAgent: (agent) =>
    set((state) => {
      const idx = state.agents.findIndex((a) => a.id === agent.id);
      if (idx >= 0) {
        const agents = [...state.agents];
        agents[idx] = agent;
        return { agents };
      }
      return { agents: [agent, ...state.agents] };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setSearchQuery: (value) => set({ searchQuery: value, currentPage: 1 }),
  setStatusFilter: (value) => set({ statusFilter: value, currentPage: 1 }),
  setCategoryFilter: (value) =>
    set({ categoryFilter: value, currentPage: 1 }),
  setTypeFilter: (value) => set({ typeFilter: value, currentPage: 1 }),
  setBranchFilter: (value) => set({ branchFilter: value, currentPage: 1 }),
  toggleFilters: () => set((s) => ({ showFilters: !s.showFilters })),
  setPage: (page) => set({ currentPage: Math.max(1, page) }),

  setAgentEnabled: (id, enabled) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              enabled,
              status: enabled ? "active" : "inactive",
              updatedAt: new Date().toISOString(),
            }
          : agent,
      ),
    })),

  updateAgent: (id, patch) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : agent,
      ),
    })),

  createAgent: (input) => {
    const now = new Date().toISOString();
    const agent: Agent = {
      ...input,
      id: createAgentId(input.name),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ agents: [agent, ...state.agents] }));
    return agent;
  },

  deployFromTemplate: (template, config) => {
    const defaults = templateToAgentDefaults(template, config);
    const now = new Date().toISOString();
    const agent: Agent = {
      id: createAgentId(config.agentName),
      name: config.agentName,
      type: defaults.type ?? template.defaultType,
      category: defaults.category ?? template.category,
      status: "active",
      environment: config.environment,
      enabled: true,
      languages: ["English (US)"],
      createdAt: now,
      updatedAt: now,
      avatarGradient:
        defaults.avatarGradient ??
        template.avatarGradient ??
        "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
      firstMessage: defaults.firstMessage ?? template.defaultFirstMessage,
      systemPrompt: defaults.systemPrompt ?? template.samplePrompt,
      demoAudioUrl: defaults.demoAudioUrl ?? template.demoAudioUrl,
      voice: defaults.voice ?? {
        provider: "ElevenLabs",
        model: "eleven_turbo_v2",
        name: "Professional Neutral",
        latencyMs: 310,
      },
      model: {
        provider: "OpenAI",
        name: "gpt-4o-mini",
        latencyMs: 450,
        estimatedCostPerMin: 0.012,
      },
      transcriber: {
        provider: "Deepgram",
        language: "en-US",
        latencyMs: 180,
        estimatedCostPerMin: 0.004,
      },
      server: {
        provider: "PropNex Cloud",
        region: "us-east-1",
        environment: config.environment,
        connectionStatus: "connected",
      },
      structuredOutputs: [
        {
          id: "so-customer-name",
          name: "Customer Name",
          description: "Full name of the caller",
          type: "text",
          required: true,
        },
        {
          id: "so-interest-level",
          name: "Interest Level",
          description: "Lead interest rating",
          type: "enum",
          required: false,
        },
      ],
      scorecards: [
        {
          id: "sc-greeting",
          name: "Greeting Quality",
          criteria: "Professional opening",
          weight: 25,
        },
      ],
      monitors: [
        {
          id: "mon-quality",
          name: "Quality Monitoring",
          type: "quality",
          status: "active",
        },
      ],
      knowledgeSources: [],
      integrations: [],
    };

    set((state) => ({ agents: [agent, ...state.agents] }));
    return agent;
  },

  getAgentById: (id) => get().agents.find((a) => a.id === id),
}));

/** Helper for non-React consumers */
export function getAgentsList(): Agent[] {
  return useAgentsStore.getState().agents;
}
