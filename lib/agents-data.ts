export type AgentType = "inbound" | "outbound" | "hybrid";
export type AgentStatus = "active" | "inactive";
export type AgentEnvironment = "production" | "staging" | "development";
export type AgentStatusFilter = "all" | AgentStatus;
export type AgentTypeFilter = "all" | AgentType;
export type AgentCategoryFilter = "all" | string;

export type StructuredOutputField = {
  id: string;
  name: string;
  description: string;
  type: "text" | "number" | "boolean" | "enum";
  required: boolean;
};

export type Scorecard = {
  id: string;
  name: string;
  criteria: string;
  weight: number;
};

export type Monitor = {
  id: string;
  name: string;
  type: "compliance" | "quality" | "lead-qualification";
  status: "active" | "inactive";
};

export type KnowledgeSource = {
  id: string;
  name: string;
  type: "document" | "faq" | "url" | "knowledge-base";
  status: "synced" | "pending" | "error";
};

export type Integration = {
  id: string;
  name: string;
  type: "crm" | "calendar" | "webhook" | "email" | "messaging" | "api";
  status: "connected" | "disconnected" | "error";
  health: "healthy" | "degraded" | "down";
};

export type VoiceConfig = {
  provider: string;
  model: string;
  name: string;
  latencyMs: number;
};

export type ModelConfig = {
  provider: string;
  name: string;
  latencyMs: number;
  estimatedCostPerMin: number;
};

export type TranscriberConfig = {
  provider: string;
  language: string;
  latencyMs: number;
  estimatedCostPerMin: number;
};

export type ServerConfig = {
  provider: string;
  region: string;
  environment: AgentEnvironment;
  connectionStatus: "connected" | "disconnected" | "degraded";
};

export type Agent = {
  id: string;
  name: string;
  type: AgentType;
  category: string;
  status: AgentStatus;
  environment: AgentEnvironment;
  enabled: boolean;
  languages: string[];
  createdAt: string;
  updatedAt: string;
  avatarGradient: string;
  firstMessage: string;
  systemPrompt: string;
  voice: VoiceConfig;
  model: ModelConfig;
  transcriber: TranscriberConfig;
  server: ServerConfig;
  structuredOutputs: StructuredOutputField[];
  scorecards: Scorecard[];
  monitors: Monitor[];
  knowledgeSources: KnowledgeSource[];
  integrations: Integration[];
  demoAudioUrl?: string;
};

/** @deprecated Use Agent instead */
export type AgentCardData = Pick<
  Agent,
  | "id"
  | "name"
  | "status"
  | "enabled"
  | "avatarGradient"
  | "languages"
> & {
  role: string;
  voiceProfile: string;
};

export const AGENT_CATEGORIES = [
  "Customer Experience",
  "Technical Support",
  "Outbound Lead Gen",
  "Appointment Scheduling",
  "Sales",
  "Lead Qualification",
  "Follow-Up",
  "FAQ",
] as const;

export const ACCENT_OPTIONS = [
  "North American",
  "British",
  "Australian",
  "European",
  "Latin American",
] as const;

export const AGENT_STATUS_FILTER_OPTIONS: {
  value: AgentStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const AGENT_TYPE_FILTER_OPTIONS: {
  value: AgentTypeFilter;
  label: string;
}[] = [
  { value: "all", label: "All Types" },
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
  { value: "hybrid", label: "Hybrid" },
];

export const AGENT_CATEGORY_FILTER_OPTIONS: {
  value: AgentCategoryFilter;
  label: string;
}[] = [
  { value: "all", label: "All Categories" },
  ...AGENT_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const DEFAULT_STRUCTURED_OUTPUTS: StructuredOutputField[] = [
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
  {
    id: "so-follow-up",
    name: "Follow-Up Required",
    description: "Whether a follow-up is needed",
    type: "boolean",
    required: false,
  },
];

const DEFAULT_SCORECARDS: Scorecard[] = [
  {
    id: "sc-greeting",
    name: "Greeting Quality",
    criteria: "Professional and warm opening within 3 seconds",
    weight: 20,
  },
  {
    id: "sc-resolution",
    name: "Resolution Rate",
    criteria: "Successfully addresses caller intent",
    weight: 40,
  },
];

const DEFAULT_MONITORS: Monitor[] = [
  {
    id: "mon-compliance",
    name: "Compliance Monitoring",
    type: "compliance",
    status: "active",
  },
  {
    id: "mon-quality",
    name: "Quality Monitoring",
    type: "quality",
    status: "active",
  },
];

function buildAgent(
  partial: Pick<Agent, "id" | "name" | "type" | "category"> &
    Partial<Omit<Agent, "id" | "name" | "type" | "category">>,
): Agent {
  const now = new Date().toISOString();
  return {
    status: "active",
    environment: "production",
    enabled: true,
    languages: ["English (US)"],
    createdAt: now,
    updatedAt: now,
    avatarGradient:
      "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
    firstMessage: `Hello, this is ${partial.name}. How can I help you today?`,
    systemPrompt: `You are ${partial.name}, a professional AI voice agent for PropNex AI. Be helpful, concise, and empathetic.`,
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Professional Neutral",
      latencyMs: 320,
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
      environment: "production",
      connectionStatus: "connected",
    },
    structuredOutputs: DEFAULT_STRUCTURED_OUTPUTS,
    scorecards: DEFAULT_SCORECARDS,
    monitors: DEFAULT_MONITORS,
    knowledgeSources: [],
    integrations: [],
    demoAudioUrl: "/samples/agent-voice-demo.mp3",
    ...partial,
  };
}

export const initialAgents: Agent[] = [
  buildAgent({
    id: "elysian-primary",
    name: "Elysian Primary",
    type: "hybrid",
    category: "Customer Experience",
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Professional Male",
      latencyMs: 310,
    },
    avatarGradient:
      "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
    knowledgeSources: [
      {
        id: "ks-1",
        name: "Product FAQ",
        type: "faq",
        status: "synced",
      },
    ],
    integrations: [
      {
        id: "int-crm",
        name: "Salesforce CRM",
        type: "crm",
        status: "connected",
        health: "healthy",
      },
    ],
  }),
  buildAgent({
    id: "nexus-global",
    name: "Nexus Global",
    type: "inbound",
    category: "Technical Support",
    languages: ["Spanish (MX)", "English (UK)"],
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Soft Female",
      latencyMs: 295,
    },
    avatarGradient:
      "bg-gradient-to-br from-blue-500/40 via-teal-500/30 to-emerald-500/20",
  }),
  buildAgent({
    id: "vortex-sales",
    name: "Vortex Sales",
    type: "outbound",
    category: "Outbound Lead Gen",
    status: "inactive",
    enabled: false,
    voice: {
      provider: "PlayHT",
      model: "playht-2.0",
      name: "Confident Neutral",
      latencyMs: 340,
    },
    avatarGradient:
      "bg-gradient-to-br from-orange-500/40 via-rose-500/30 to-red-500/20",
  }),
  buildAgent({
    id: "aria-concierge",
    name: "Aria Concierge",
    type: "inbound",
    category: "Appointment Scheduling",
    languages: ["French (FR)"],
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Eloquent Female",
      latencyMs: 305,
    },
    avatarGradient:
      "bg-gradient-to-br from-fuchsia-500/40 via-purple-500/30 to-pink-500/20",
    integrations: [
      {
        id: "int-cal",
        name: "Google Calendar",
        type: "calendar",
        status: "connected",
        health: "healthy",
      },
    ],
  }),
  buildAgent({
    id: "propnex-lead-qual",
    name: "PropNex Lead Qualifier",
    type: "outbound",
    category: "Lead Qualification",
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Assertive Male",
      latencyMs: 315,
    },
    avatarGradient:
      "bg-gradient-to-br from-amber-500/40 via-yellow-500/30 to-orange-500/20",
    structuredOutputs: [
      ...DEFAULT_STRUCTURED_OUTPUTS,
      {
        id: "so-budget",
        name: "Budget",
        description: "Customer budget range",
        type: "text",
        required: false,
      },
      {
        id: "so-property-type",
        name: "Property Type",
        description: "Type of property interested in",
        type: "enum",
        required: false,
      },
    ],
  }),
  buildAgent({
    id: "follow-up-agent",
    name: "Follow-Up Agent",
    type: "outbound",
    category: "Follow-Up",
    voice: {
      provider: "PlayHT",
      model: "playht-2.0",
      name: "Warm Female",
      latencyMs: 330,
    },
    avatarGradient:
      "bg-gradient-to-br from-teal-500/40 via-cyan-500/30 to-blue-500/20",
  }),
  buildAgent({
    id: "lead-reactivation",
    name: "Lead Reactivation Agent",
    type: "outbound",
    category: "Outbound Lead Gen",
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Energetic Neutral",
      latencyMs: 325,
    },
    avatarGradient:
      "bg-gradient-to-br from-rose-500/40 via-pink-500/30 to-fuchsia-500/20",
  }),
  buildAgent({
    id: "faq-agent",
    name: "FAQ Agent",
    type: "inbound",
    category: "FAQ",
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Clear Female",
      latencyMs: 290,
    },
    avatarGradient:
      "bg-gradient-to-br from-slate-500/40 via-gray-500/30 to-zinc-500/20",
    knowledgeSources: [
      {
        id: "ks-faq",
        name: "Company FAQ",
        type: "faq",
        status: "synced",
      },
      {
        id: "ks-docs",
        name: "Product Documentation",
        type: "document",
        status: "synced",
      },
    ],
  }),
  buildAgent({
    id: "sales-closer",
    name: "Sales Closer",
    type: "hybrid",
    category: "Sales",
    voice: {
      provider: "PlayHT",
      model: "playht-2.0",
      name: "Persuasive Male",
      latencyMs: 335,
    },
    avatarGradient:
      "bg-gradient-to-br from-emerald-500/40 via-green-500/30 to-lime-500/20",
  }),
  buildAgent({
    id: "support-tier2",
    name: "Support Tier 2",
    type: "inbound",
    category: "Technical Support",
    environment: "staging",
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Calm Male",
      latencyMs: 300,
    },
    avatarGradient:
      "bg-gradient-to-br from-indigo-500/40 via-blue-500/30 to-sky-500/20",
  }),
  buildAgent({
    id: "appointment-bot",
    name: "Appointment Bot",
    type: "inbound",
    category: "Appointment Scheduling",
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Friendly Female",
      latencyMs: 288,
    },
    avatarGradient:
      "bg-gradient-to-br from-purple-500/40 via-violet-500/30 to-indigo-500/20",
  }),
  buildAgent({
    id: "real-estate-qual",
    name: "Real Estate Qualifier",
    type: "outbound",
    category: "Lead Qualification",
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Professional Female",
      latencyMs: 318,
    },
    avatarGradient:
      "bg-gradient-to-br from-cyan-500/40 via-teal-500/30 to-emerald-500/20",
    monitors: [
      ...DEFAULT_MONITORS,
      {
        id: "mon-lead",
        name: "Lead Qualification Monitoring",
        type: "lead-qualification",
        status: "active",
      },
    ],
  }),
  buildAgent({
    id: "customer-support",
    name: "Customer Support Agent",
    type: "inbound",
    category: "Customer Experience",
    voice: {
      provider: "ElevenLabs",
      model: "eleven_turbo_v2",
      name: "Empathetic Female",
      latencyMs: 292,
    },
    avatarGradient:
      "bg-gradient-to-br from-sky-500/40 via-blue-500/30 to-indigo-500/20",
  }),
  buildAgent({
    id: "dev-test-agent",
    name: "Dev Test Agent",
    type: "hybrid",
    category: "Customer Experience",
    environment: "development",
    status: "inactive",
    enabled: false,
    server: {
      provider: "PropNex Cloud",
      region: "us-west-2",
      environment: "development",
      connectionStatus: "degraded",
    },
    avatarGradient:
      "bg-gradient-to-br from-neutral-500/40 via-stone-500/30 to-zinc-500/20",
  }),
  buildAgent({
    id: "outbound-nurture",
    name: "Outbound Nurture",
    type: "outbound",
    category: "Follow-Up",
    voice: {
      provider: "PlayHT",
      model: "playht-2.0",
      name: "Gentle Male",
      latencyMs: 328,
    },
    avatarGradient:
      "bg-gradient-to-br from-lime-500/40 via-green-500/30 to-emerald-500/20",
  }),
];

/** Static export for mock data generators (call logs, phone numbers) */
export const agents = initialAgents;

export function agentToCardData(agent: Agent): AgentCardData {
  return {
    id: agent.id,
    name: agent.name,
    role: agent.category,
    languages: agent.languages,
    status: agent.status === "active" ? "active" : "inactive",
    voiceProfile: agent.voice.name,
    enabled: agent.enabled,
    avatarGradient: agent.avatarGradient,
  };
}

export function filterAgents(
  agentList: Agent[],
  searchQuery: string,
  statusFilter: AgentStatusFilter,
  categoryFilter: AgentCategoryFilter,
  typeFilter: AgentTypeFilter,
): Agent[] {
  const query = searchQuery.trim().toLowerCase();

  return agentList.filter((agent) => {
    if (statusFilter !== "all" && agent.status !== statusFilter) return false;
    if (categoryFilter !== "all" && agent.category !== categoryFilter)
      return false;
    if (typeFilter !== "all" && agent.type !== typeFilter) return false;
    if (!query) return true;

    return (
      agent.name.toLowerCase().includes(query) ||
      agent.category.toLowerCase().includes(query) ||
      agent.type.toLowerCase().includes(query) ||
      agent.voice.name.toLowerCase().includes(query)
    );
  });
}

export type AgentsDashboardStats = {
  totalAgents: number;
  activeAgents: number;
  totalCalls: number;
  avgConversionRate: number;
};

export function createAgentId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now().toString(36)}`;
}
