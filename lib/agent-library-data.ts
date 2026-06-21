import type { Agent, AgentEnvironment, AgentType } from "@/lib/agents-data";
import type { GraphQLAgentLibraryEntry } from "@/lib/graphql/queries/agent-library";

export type AgentLibraryTemplate = {
  id: string;
  libraryEntryId: string;
  name: string;
  category: string;
  profile: string;
  useCases: string[];
  estimatedSetupMinutes: number;
  defaultType: AgentType;
  samplePrompt: string;
  defaultFirstMessage: string;
  defaultVariables: { key: string; label: string; placeholder: string }[];
  compatibleVoices: { id: string; name: string; provider: string }[];
  demoAudioUrl: string;
  avatarGradient?: string;
};

function toLowerAgentType(value: string): AgentType {
  return value.toLowerCase().replace(/_/g, "-") as AgentType;
}

export function mapGraphQLLibraryEntryToTemplate(
  entry: GraphQLAgentLibraryEntry,
): AgentLibraryTemplate {
  return {
    id: entry.slug,
    libraryEntryId: entry.id,
    name: entry.name,
    category: entry.category,
    profile: entry.profile,
    useCases: entry.useCases,
    estimatedSetupMinutes: entry.estimatedSetupMinutes,
    defaultType: toLowerAgentType(entry.defaultType),
    samplePrompt: entry.samplePrompt,
    defaultFirstMessage: entry.defaultFirstMessage,
    defaultVariables: Array.isArray(entry.defaultVariables)
      ? entry.defaultVariables
      : [],
    compatibleVoices: Array.isArray(entry.compatibleVoices)
      ? entry.compatibleVoices
      : [],
    demoAudioUrl: entry.demoAudioUrl,
    avatarGradient: entry.avatarGradient ?? undefined,
  };
}

export function filterLibraryTemplates(
  templates: AgentLibraryTemplate[],
  searchQuery: string,
  categoryFilter: string,
): AgentLibraryTemplate[] {
  const query = searchQuery.trim().toLowerCase();
  return templates.filter((t) => {
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (!query) return true;
    return (
      t.name.toLowerCase().includes(query) ||
      t.profile.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.useCases.some((u) => u.toLowerCase().includes(query))
    );
  });
}

export const LIBRARY_CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Normal", label: "Normal" },
  { value: "Premium", label: "Premium" },
];

export type DeployFromTemplateConfig = {
  agentName: string;
  voiceId: string;
  phoneNumberId: string | null;
  variables: Record<string, string>;
  environment: AgentEnvironment;
};

export function templateToAgentDefaults(
  template: AgentLibraryTemplate,
  config: DeployFromTemplateConfig,
): Partial<Agent> {
  const voice = template.compatibleVoices.find((v) => v.id === config.voiceId);
  let firstMessage = template.defaultFirstMessage;
  for (const [key, value] of Object.entries(config.variables)) {
    firstMessage = firstMessage.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      value,
    );
  }

  return {
    name: config.agentName,
    type: template.defaultType,
    category: template.category,
    environment: config.environment,
    firstMessage,
    systemPrompt: template.samplePrompt,
    demoAudioUrl: template.demoAudioUrl,
    avatarGradient:
      template.avatarGradient ??
      "bg-gradient-to-br from-violet-500/40 via-indigo-500/30 to-cyan-500/20",
    voice: {
      provider: voice?.provider ?? "ElevenLabs",
      model: voice?.provider === "PlayHT" ? "playht-2.0" : "eleven_turbo_v2",
      name: voice?.name ?? "Professional Neutral",
      latencyMs: 310,
    },
  };
}
