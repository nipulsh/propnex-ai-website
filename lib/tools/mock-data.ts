import type { AgentToolAssignment, AgentToolId } from "./types";
import {
  DEFAULT_BILLING_CONFIG,
  DEFAULT_CALENDAR_TOOL_CONFIG,
  DEFAULT_FAQ_CONFIG,
  DEFAULT_SHEETS_TOOL_CONFIG,
} from "./types";

function createToolAssignment(
  toolId: AgentToolId,
  enabled: boolean,
  overrides?: Partial<AgentToolAssignment>,
): AgentToolAssignment {
  const configs = {
    faq: DEFAULT_FAQ_CONFIG,
    billing: DEFAULT_BILLING_CONFIG,
    "google-calendar": DEFAULT_CALENDAR_TOOL_CONFIG,
    "google-sheets": DEFAULT_SHEETS_TOOL_CONFIG,
  };

  return {
    toolId,
    enabled,
    status: enabled ? "enabled" : "disabled",
    health: enabled ? "healthy" : "unavailable",
    config: configs[toolId],
    usage: {
      totalExecutions: enabled ? Math.floor(Math.random() * 500) + 50 : 0,
      successRate: enabled ? 0.92 + Math.random() * 0.07 : 0,
      lastUsedAt: enabled ? "2026-06-18T07:30:00Z" : null,
      errorCount: enabled ? Math.floor(Math.random() * 5) : 0,
    },
    ...(overrides?.config ? { config: overrides.config } : {}),
    ...Object.fromEntries(
      Object.entries(overrides ?? {}).filter(([k]) => k !== "config"),
    ),
  };
}

/** Per-agent default tool assignments per plan spec */
export const AGENT_TOOL_DEFAULTS: Record<string, AgentToolId[]> = {
  // Sales agent: FAQ + Calendar + Sheets
  "sales-closer": ["faq", "google-calendar", "google-sheets"],
  "vortex-sales": ["faq", "google-calendar", "google-sheets"],
  // Support agent: FAQ + Billing
  "support-tier2": ["faq", "billing"],
  "customer-support": ["faq", "billing"],
  "nexus-global": ["faq", "billing"],
  // Appointment agent: Calendar + Sheets
  "appointment-bot": ["google-calendar", "google-sheets"],
  "aria-concierge": ["google-calendar", "google-sheets"],
  // FAQ-focused
  "faq-agent": ["faq"],
  // Lead qual: FAQ + Sheets
  "propnex-lead-qual": ["faq", "google-sheets"],
  "real-estate-qual": ["faq", "google-sheets"],
};

const ALL_TOOLS: AgentToolId[] = [
  "faq",
  "billing",
  "google-calendar",
  "google-sheets",
];

export function buildDefaultAgentTools(agentId: string): AgentToolAssignment[] {
  const enabledTools = AGENT_TOOL_DEFAULTS[agentId] ?? ["faq"];

  return ALL_TOOLS.map((toolId) =>
    createToolAssignment(toolId, enabledTools.includes(toolId), {
      config:
        toolId === "faq"
          ? {
              ...DEFAULT_FAQ_CONFIG,
              knowledgeSourceIds: agentId === "faq-agent" ? ["ks-faq", "ks-docs"] : [],
            }
          : undefined,
    }),
  );
}

export function buildAllAgentToolDefaults(): Record<
  string,
  AgentToolAssignment[]
> {
  const agentIds = [
    "elysian-primary",
    "nexus-global",
    "vortex-sales",
    "aria-concierge",
    "propnex-lead-qual",
    "follow-up-agent",
    "lead-reactivation",
    "faq-agent",
    "sales-closer",
    "support-tier2",
    "appointment-bot",
    "real-estate-qual",
    "customer-support",
    "dev-test-agent",
    "outbound-nurture",
  ];

  return Object.fromEntries(
    agentIds.map((id) => [id, buildDefaultAgentTools(id)]),
  );
}
