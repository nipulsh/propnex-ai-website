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
export const DEFAULT_STRUCTURED_OUTPUTS: StructuredOutputField[] = [
  { id: "so-customer-name", name: "Customer Name", description: "Full name of the caller", type: "text", required: true },
  { id: "so-interest-level", name: "Interest Level", description: "Lead interest rating", type: "enum", required: false },
];

export const DEFAULT_SCORECARDS: Scorecard[] = [
  { id: "sc-greeting", name: "Greeting Quality", criteria: "Professional opening", weight: 25 },
];

export const DEFAULT_MONITORS: Monitor[] = [
  { id: "mon-quality", name: "Quality Monitoring", type: "quality", status: "active" },
];

export const initialAgents: Agent[] = [];
export const agents: Agent[] = [];

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
