import type { Agent, AgentEnvironment, AgentStatus, AgentType } from "@/lib/agents-data";
import { getLeadTemperatureForCall } from "@/lib/call-detail-data";

type GraphQLAgent = {
  id: string;
  name: string;
  type: string;
  category?: string | null;
  status: string;
  environment: string;
  enabled: boolean;
  languages: string[];
  firstMessage?: string | null;
  systemPrompt?: string | null;
  voiceConfig?: Record<string, unknown> | null;
  modelConfig?: Record<string, unknown> | null;
  transcriberConfig?: Record<string, unknown> | null;
  serverConfig?: Record<string, unknown> | null;
  structuredOutputs?: unknown;
  scorecards?: unknown;
  monitors?: unknown;
  demoAudioUrl?: string | null;
  branchId?: string | null;
  createdAt: string;
  updatedAt: string;
};

function toLowerEnum<T extends string>(value: string): T {
  return value.toLowerCase().replace(/_/g, "-") as T;
}

const DEFAULT_VOICE = {
  provider: "ElevenLabs",
  model: "eleven_turbo_v2",
  name: "Professional Neutral",
  latencyMs: 310,
};

const DEFAULT_MODEL = {
  provider: "OpenAI",
  name: "gpt-4o-mini",
  latencyMs: 450,
  estimatedCostPerMin: 0.012,
};

const DEFAULT_TRANSCRIBER = {
  provider: "Deepgram",
  language: "en-US",
  latencyMs: 180,
  estimatedCostPerMin: 0.004,
};

export function mapGraphQLAgentToUI(agent: GraphQLAgent): Agent {
  const environment = toLowerEnum<AgentEnvironment>(agent.environment);
  const voice = {
    ...DEFAULT_VOICE,
    ...(agent.voiceConfig as Partial<Agent["voice"]> | null),
  };
  const model = {
    ...DEFAULT_MODEL,
    ...(agent.modelConfig as Partial<Agent["model"]> | null),
  };
  const transcriber = {
    ...DEFAULT_TRANSCRIBER,
    ...(agent.transcriberConfig as Partial<Agent["transcriber"]> | null),
  };
  const server = {
    provider: "PropNex Cloud",
    region: "us-east-1",
    environment,
    connectionStatus: "connected" as const,
    ...(agent.serverConfig as Partial<Agent["server"]> | null),
  };

  return {
    id: agent.id,
    name: agent.name,
    type: toLowerEnum<AgentType>(agent.type),
    category: agent.category ?? "General",
    status: toLowerEnum<AgentStatus>(agent.status),
    environment,
    enabled: agent.enabled,
    languages: agent.languages,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
    avatarGradient:
      "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
    firstMessage: agent.firstMessage ?? "",
    systemPrompt: agent.systemPrompt ?? "",
    voice,
    model,
    transcriber,
    server,
    structuredOutputs: Array.isArray(agent.structuredOutputs)
      ? (agent.structuredOutputs as Agent["structuredOutputs"])
      : [],
    scorecards: Array.isArray(agent.scorecards)
      ? (agent.scorecards as Agent["scorecards"])
      : [],
    monitors: Array.isArray(agent.monitors)
      ? (agent.monitors as Agent["monitors"])
      : [],
    knowledgeSources: [],
    integrations: [],
    demoAudioUrl: agent.demoAudioUrl ?? undefined,
    branchId: agent.branchId ?? null,
  };
}

export function mapUIAgentToCreateInput(agent: Partial<Agent> & { libraryEntryId?: string }) {
  return {
    name: agent.name,
    type: agent.type?.toUpperCase().replace(/-/g, "_"),
    category: agent.category,
    environment: agent.environment?.toUpperCase(),
    firstMessage: agent.firstMessage,
    systemPrompt: agent.systemPrompt,
    languages: agent.languages,
    voiceConfig: agent.voice,
    modelConfig: agent.model,
    transcriberConfig: agent.transcriber,
    serverConfig: agent.server,
    structuredOutputs: agent.structuredOutputs,
    scorecards: agent.scorecards,
    monitors: agent.monitors,
    demoAudioUrl: agent.demoAudioUrl,
    libraryEntryId: agent.libraryEntryId,
  };
}

type GraphQLCallLogNode = {
  id: string;
  startedAt: string;
  direction: string;
  status: string;
  durationSeconds: number;
  creditsUsed?: number | null;
  lead?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  } | null;
};

export function mapGraphQLCallLogToUI(
  node: GraphQLCallLogNode,
  agentId: string,
  agentName = "Agent",
): import("@/lib/call-logs-data").CallLog {
  return {
    id: node.id,
    timestamp: new Date(node.startedAt).getTime(),
    direction: node.direction.toLowerCase() as "inbound" | "outbound",
    phoneNumberId: "",
    phoneNumber: "",
    lineLabel: "",
    leadPhone: node.lead?.phone ?? "—",
    leadName:
      [node.lead?.firstName, node.lead?.lastName].filter(Boolean).join(" ") ||
      "Unknown",
    agentId,
    agentName,
    status: node.status.toLowerCase() as
      | "completed"
      | "missed"
      | "voicemail"
      | "failed",
    durationSeconds: node.durationSeconds,
    outcome: null,
    leadTemperature: getLeadTemperatureForCall(node.id),
    leadScore: 0,
    callCost: 0,
    creditsUsed: node.creditsUsed ?? 0,
    provider: "—",
    summarySnippet: "—",
    hasRecording: false,
    recordingUrl: null,
    sentimentOutcome: null,
    hasTranscript: false,
  };
}
