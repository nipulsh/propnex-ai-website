import { create } from "zustand";

import {
  type Agent,
  type AgentEnvironment,
  type AgentType,
  AGENT_CATEGORIES,
  ACCENT_OPTIONS,
} from "@/lib/agents-data";

export type VoiceGender = "M" | "F" | "N";

export type CreateAgentDraft = {
  agentName: string;
  type: AgentType;
  category: string;
  environment: AgentEnvironment;
  languages: string[];
  voiceGender: VoiceGender;
  accent: string;
  voiceProvider: string;
  firstMessage: string;
  systemPrompt: string;
  modelProvider: string;
  modelName: string;
  transcriberProvider: string;
  transcriberLanguage: string;
  knowledgeEnabled: {
    documents: boolean;
    faq: boolean;
    urls: boolean;
    knowledgeBase: boolean;
  };
  integrations: {
    crm: boolean;
    calendar: boolean;
    webhooks: boolean;
    email: boolean;
    messaging: boolean;
  };
  structuredOutputNames: string[];
  monitors: string[];
  avatarGradient: string;
};

const defaultDraft: CreateAgentDraft = {
  agentName: "",
  type: "hybrid",
  category: AGENT_CATEGORIES[0],
  environment: "production",
  languages: ["English (US)"],
  voiceGender: "M",
  accent: ACCENT_OPTIONS[0],
  voiceProvider: "ElevenLabs",
  firstMessage: "",
  systemPrompt: "",
  modelProvider: "OpenAI",
  modelName: "gpt-4o-mini",
  transcriberProvider: "Deepgram",
  transcriberLanguage: "en-US",
  knowledgeEnabled: {
    documents: false,
    faq: false,
    urls: false,
    knowledgeBase: false,
  },
  integrations: {
    crm: false,
    calendar: false,
    webhooks: false,
    email: false,
    messaging: false,
  },
  structuredOutputNames: [],
  monitors: ["Quality Monitoring"],
  avatarGradient:
    "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
};

export const CREATE_AGENT_STEPS = [
  { id: "basics", label: "Basics" },
  { id: "voice", label: "Voice" },
  { id: "prompt", label: "Prompt" },
  { id: "model", label: "AI Model" },
  { id: "knowledge", label: "Knowledge" },
  { id: "integrations", label: "Integrations" },
  { id: "outputs", label: "Outputs" },
  { id: "monitoring", label: "Monitoring" },
  { id: "testing", label: "Testing" },
  { id: "deploy", label: "Deploy" },
] as const;

type CreateAgentStore = {
  currentStep: number;
  editAgentId: string | null;
  draft: CreateAgentDraft;
  testResult: string | null;
  setStep: (step: number) => void;
  setEditAgentId: (id: string | null) => void;
  updateDraft: (patch: Partial<CreateAgentDraft>) => void;
  addLanguage: (language: string) => void;
  removeLanguage: (language: string) => void;
  addStructuredOutput: (name: string) => void;
  removeStructuredOutput: (name: string) => void;
  toggleMonitor: (name: string) => void;
  loadFromAgent: (agent: Agent) => void;
  setTestResult: (result: string | null) => void;
  reset: () => void;
};

export const useCreateAgentStore = create<CreateAgentStore>((set) => ({
  currentStep: 1,
  editAgentId: null,
  draft: defaultDraft,
  testResult: null,

  setStep: (step) =>
    set({
      currentStep: Math.max(1, Math.min(CREATE_AGENT_STEPS.length, step)),
    }),

  setEditAgentId: (id) => set({ editAgentId: id }),

  updateDraft: (patch) =>
    set((state) => ({ draft: { ...state.draft, ...patch } })),

  addLanguage: (language) =>
    set((state) => {
      const trimmed = language.trim();
      if (!trimmed || state.draft.languages.includes(trimmed)) return state;
      return {
        draft: {
          ...state.draft,
          languages: [...state.draft.languages, trimmed],
        },
      };
    }),

  removeLanguage: (language) =>
    set((state) => ({
      draft: {
        ...state.draft,
        languages: state.draft.languages.filter((l) => l !== language),
      },
    })),

  addStructuredOutput: (name) =>
    set((state) => {
      const trimmed = name.trim();
      if (!trimmed || state.draft.structuredOutputNames.includes(trimmed))
        return state;
      return {
        draft: {
          ...state.draft,
          structuredOutputNames: [
            ...state.draft.structuredOutputNames,
            trimmed,
          ],
        },
      };
    }),

  removeStructuredOutput: (name) =>
    set((state) => ({
      draft: {
        ...state.draft,
        structuredOutputNames: state.draft.structuredOutputNames.filter(
          (n) => n !== name,
        ),
      },
    })),

  toggleMonitor: (name) =>
    set((state) => {
      const exists = state.draft.monitors.includes(name);
      return {
        draft: {
          ...state.draft,
          monitors: exists
            ? state.draft.monitors.filter((m) => m !== name)
            : [...state.draft.monitors, name],
        },
      };
    }),

  loadFromAgent: (agent) =>
    set({
      editAgentId: agent.id,
      draft: {
        agentName: agent.name,
        type: agent.type,
        category: agent.category,
        environment: agent.environment,
        languages: [...agent.languages],
        voiceGender: "N",
        accent: ACCENT_OPTIONS[0],
        voiceProvider: agent.voice.provider,
        firstMessage: agent.firstMessage,
        systemPrompt: agent.systemPrompt,
        modelProvider: agent.model.provider,
        modelName: agent.model.name,
        transcriberProvider: agent.transcriber.provider,
        transcriberLanguage: agent.transcriber.language,
        knowledgeEnabled: {
          documents: agent.knowledgeSources.some((k) => k.type === "document"),
          faq: agent.knowledgeSources.some((k) => k.type === "faq"),
          urls: agent.knowledgeSources.some((k) => k.type === "url"),
          knowledgeBase: agent.knowledgeSources.some(
            (k) => k.type === "knowledge-base",
          ),
        },
        integrations: {
          crm: agent.integrations.some((i) => i.type === "crm"),
          calendar: agent.integrations.some((i) => i.type === "calendar"),
          webhooks: agent.integrations.some((i) => i.type === "webhook"),
          email: agent.integrations.some((i) => i.type === "email"),
          messaging: agent.integrations.some((i) => i.type === "messaging"),
        },
        structuredOutputNames: agent.structuredOutputs.map((s) => s.name),
        monitors: agent.monitors.map((m) => m.name),
        avatarGradient: agent.avatarGradient,
      },
    }),

  setTestResult: (result) => set({ testResult: result }),

  reset: () =>
    set({
      currentStep: 1,
      editAgentId: null,
      draft: defaultDraft,
      testResult: null,
    }),
}));

export function draftToAgentInput(
  draft: CreateAgentDraft,
): Omit<Agent, "id" | "createdAt" | "updatedAt"> {
  const knowledgeSources = [];
  if (draft.knowledgeEnabled.documents)
    knowledgeSources.push({
      id: "ks-doc",
      name: "Uploaded Documents",
      type: "document" as const,
      status: "pending" as const,
    });
  if (draft.knowledgeEnabled.faq)
    knowledgeSources.push({
      id: "ks-faq",
      name: "FAQ",
      type: "faq" as const,
      status: "synced" as const,
    });
  if (draft.knowledgeEnabled.urls)
    knowledgeSources.push({
      id: "ks-url",
      name: "URLs",
      type: "url" as const,
      status: "pending" as const,
    });
  if (draft.knowledgeEnabled.knowledgeBase)
    knowledgeSources.push({
      id: "ks-kb",
      name: "Knowledge Base",
      type: "knowledge-base" as const,
      status: "synced" as const,
    });

  const integrations = [];
  if (draft.integrations.crm)
    integrations.push({
      id: "int-crm",
      name: "CRM",
      type: "crm" as const,
      status: "connected" as const,
      health: "healthy" as const,
    });
  if (draft.integrations.calendar)
    integrations.push({
      id: "int-cal",
      name: "Calendar",
      type: "calendar" as const,
      status: "connected" as const,
      health: "healthy" as const,
    });
  if (draft.integrations.webhooks)
    integrations.push({
      id: "int-wh",
      name: "Webhooks",
      type: "webhook" as const,
      status: "connected" as const,
      health: "healthy" as const,
    });
  if (draft.integrations.email)
    integrations.push({
      id: "int-email",
      name: "Email",
      type: "email" as const,
      status: "disconnected" as const,
      health: "degraded" as const,
    });
  if (draft.integrations.messaging)
    integrations.push({
      id: "int-msg",
      name: "Messaging",
      type: "messaging" as const,
      status: "disconnected" as const,
      health: "healthy" as const,
    });

  return {
    name: draft.agentName,
    type: draft.type,
    category: draft.category,
    status: "active",
    environment: draft.environment,
    enabled: true,
    languages: draft.languages,
    avatarGradient: draft.avatarGradient,
    firstMessage:
      draft.firstMessage ||
      `Hello, this is ${draft.agentName}. How can I help you?`,
    systemPrompt:
      draft.systemPrompt ||
      `You are ${draft.agentName}, a professional AI voice agent.`,
    voice: {
      provider: draft.voiceProvider,
      model:
        draft.voiceProvider === "PlayHT" ? "playht-2.0" : "eleven_turbo_v2",
      name: `${draft.accent} ${draft.voiceGender === "F" ? "Female" : draft.voiceGender === "M" ? "Male" : "Neutral"}`,
      latencyMs: 310,
    },
    model: {
      provider: draft.modelProvider,
      name: draft.modelName,
      latencyMs: 450,
      estimatedCostPerMin: 0.012,
    },
    transcriber: {
      provider: draft.transcriberProvider,
      language: draft.transcriberLanguage,
      latencyMs: 180,
      estimatedCostPerMin: 0.004,
    },
    server: {
      provider: "PropNex Cloud",
      region: "us-east-1",
      environment: draft.environment,
      connectionStatus: "connected",
    },
    structuredOutputs: draft.structuredOutputNames.map((name, i) => ({
      id: `so-${i}`,
      name,
      description: `Extracted field: ${name}`,
      type: "text" as const,
      required: false,
    })),
    scorecards: [
      {
        id: "sc-default",
        name: "Overall Quality",
        criteria: "Professional and effective conversation",
        weight: 100,
      },
    ],
    monitors: draft.monitors.map((name, i) => ({
      id: `mon-${i}`,
      name,
      type: "quality" as const,
      status: "active" as const,
    })),
    knowledgeSources,
    integrations,
  };
}
