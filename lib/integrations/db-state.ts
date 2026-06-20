import type { IntegrationType } from "@prisma/client";

import type { Prisma } from "@prisma/client";

import { INTEGRATION_DEFINITIONS } from "@/lib/integrations/registry";
import {
  DEFAULT_CALENDAR_CONFIG,
  DEFAULT_SHEETS_CONFIG,
  type GoogleCalendarConfig,
  type GoogleSheetsConfig,
  type IntegrationId,
  type SheetRow,
  type SyncHistoryEntry,
  type WorkspaceIntegration,
} from "@/lib/integrations/types";
import type { AgentToolAssignment, AgentToolId } from "@/lib/tools/types";
import {
  DEFAULT_BILLING_CONFIG,
  DEFAULT_CALENDAR_TOOL_CONFIG,
  DEFAULT_FAQ_CONFIG,
  DEFAULT_SHEETS_TOOL_CONFIG,
} from "@/lib/tools/types";
import prisma from "@/server/lib/prisma";
import { integrationsManagementService } from "@/server/services/integrations-management.service";
import type { TenantContext } from "@/server/types/context";

const TYPE_MAP: Record<IntegrationId, IntegrationType> = {
  "google-sheets": "GOOGLE_SHEETS",
  "google-calendar": "GOOGLE_CALENDAR",
  hubspot: "HUBSPOT",
  salesforce: "SALESFORCE",
  email: "EMAIL",
  whatsapp: "WHATSAPP",
};

const ID_MAP: Partial<Record<IntegrationType, IntegrationId>> = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([k, v]) => [v, k as IntegrationId]),
);

type IntegrationConfig = {
  sheetsConfig?: GoogleSheetsConfig;
  calendarConfig?: GoogleCalendarConfig;
  spreadsheets?: { id: string; name: string; modifiedAt: string }[];
  worksheets?: Record<string, { id: string; name: string; rowCount: number }[]>;
  sheetRows?: SheetRow[];
  syncHistory?: SyncHistoryEntry[];
  calendarEvents?: Record<string, unknown>[];
};

function statusFromDb(status: string): WorkspaceIntegration["status"] {
  switch (status) {
    case "CONNECTED":
      return "connected";
    case "SYNCING":
      return "syncing";
    case "ERROR":
      return "error";
    default:
      return "not_connected";
  }
}

function parseConfig(raw: unknown): IntegrationConfig {
  if (!raw || typeof raw !== "object") return {};
  return raw as IntegrationConfig;
}

async function getOrCreateIntegration(companyId: string, id: IntegrationId) {
  const type = TYPE_MAP[id];
  return prisma.integration.upsert({
    where: { companyId_type: { companyId, type } },
    create: { company: { connect: { id: companyId } }, type, config: {} },
    update: {},
  });
}

function toWorkspaceIntegration(
  id: IntegrationId,
  row: { status: string; connectedAccount: string | null; lastSyncAt: Date | null; errorMessage: string | null; config: unknown },
): WorkspaceIntegration {
  const def = INTEGRATION_DEFINITIONS.find((d) => d.id === id);
  const config = parseConfig(row.config);
  const base: WorkspaceIntegration = {
    id,
    name: def?.name ?? id,
    status: statusFromDb(row.status),
    connectedAccount: row.connectedAccount,
    lastSyncAt: row.lastSyncAt?.toISOString() ?? null,
    errorMessage: row.errorMessage,
  };
  if (id === "google-sheets") {
    return { ...base, sheetsConfig: config.sheetsConfig ?? { ...DEFAULT_SHEETS_CONFIG } };
  }
  if (id === "google-calendar") {
    return { ...base, calendarConfig: config.calendarConfig ?? { ...DEFAULT_CALENDAR_CONFIG } };
  }
  return base;
}

export async function listIntegrations(ctx: TenantContext): Promise<WorkspaceIntegration[]> {
  const rows = await integrationsManagementService.list(ctx);
  const byType = new Map(rows.map((r) => [r.type, r]));

  return INTEGRATION_DEFINITIONS.filter((d) => d.available).map((def) => {
    const row = byType.get(TYPE_MAP[def.id]);
    if (!row) {
      return toWorkspaceIntegration(def.id, {
        status: "NOT_CONNECTED",
        connectedAccount: null,
        lastSyncAt: null,
        errorMessage: null,
        config: {},
      });
    }
    return toWorkspaceIntegration(def.id, {
      status: row.status === "connected" ? "CONNECTED" : row.status === "syncing" ? "SYNCING" : row.status === "error" ? "ERROR" : "NOT_CONNECTED",
      connectedAccount: row.connectedAccount,
      lastSyncAt: row.lastSyncAt ? new Date(row.lastSyncAt) : null,
      errorMessage: row.errorMessage,
      config: row.config,
    });
  });
}

export async function getIntegrationById(
  ctx: TenantContext,
  id: IntegrationId,
): Promise<WorkspaceIntegration | null> {
  const all = await listIntegrations(ctx);
  return all.find((i) => i.id === id) ?? null;
}

export async function connectIntegrationDb(
  ctx: TenantContext,
  id: IntegrationId,
  account?: string,
) {
  await integrationsManagementService.connect(ctx, id, account);
  return getIntegrationById(ctx, id);
}

export async function disconnectIntegrationDb(
  ctx: TenantContext,
  id: IntegrationId,
) {
  await integrationsManagementService.disconnect(ctx, id);
  return getIntegrationById(ctx, id);
}

async function mergeConfig(
  ctx: TenantContext,
  id: IntegrationId,
  patch: IntegrationConfig,
) {
  const row = await getOrCreateIntegration(ctx.companyId, id);
  const current = parseConfig(row.config);
  const next = { ...current, ...patch };
  await prisma.integration.update({
    where: { id: row.id },
    data: { config: next as Prisma.InputJsonValue },
  });
  return next;
}

export async function updateSheetsConfigDb(
  ctx: TenantContext,
  sheetsConfig: GoogleSheetsConfig,
) {
  await mergeConfig(ctx, "google-sheets", { sheetsConfig });
  return getIntegrationById(ctx, "google-sheets");
}

export async function updateCalendarConfigDb(
  ctx: TenantContext,
  calendarConfig: GoogleCalendarConfig,
) {
  await mergeConfig(ctx, "google-calendar", { calendarConfig });
  return getIntegrationById(ctx, "google-calendar");
}

export async function getSpreadsheetsDb(ctx: TenantContext) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-sheets");
  return parseConfig(row.config).spreadsheets ?? [];
}

export async function createSpreadsheetDb(ctx: TenantContext, name: string) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-sheets");
  const config = parseConfig(row.config);
  const sheet = {
    id: `sheet-${Date.now()}`,
    name,
    modifiedAt: new Date().toISOString(),
  };
  const spreadsheets = [sheet, ...(config.spreadsheets ?? [])];
  await mergeConfig(ctx, "google-sheets", {
    spreadsheets,
    worksheets: { ...config.worksheets, [sheet.id]: [{ id: "ws-1", name: "Sheet1", rowCount: 0 }] },
  });
  return sheet;
}

export async function getWorksheetsDb(ctx: TenantContext, spreadsheetId: string) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-sheets");
  return parseConfig(row.config).worksheets?.[spreadsheetId] ?? [];
}

export async function getSyncHistoryDb(ctx: TenantContext): Promise<SyncHistoryEntry[]> {
  const row = await prisma.integration.findFirst({
    where: { companyId: ctx.companyId, type: "GOOGLE_SHEETS" },
  });
  if (!row) return [];
  const logs = await prisma.integrationSyncLog.findMany({
    where: { integrationId: row.id },
    orderBy: { startedAt: "desc" },
    take: 20,
  });
  return logs.map((log) => ({
    id: log.id,
    startedAt: log.startedAt.toISOString(),
    completedAt: log.completedAt?.toISOString() ?? log.startedAt.toISOString(),
    result: log.result === "SUCCESS" ? "success" : log.result === "PARTIAL" ? "partial" : "error",
    rowsSynced: log.rowsSynced,
    message: log.message ?? "",
  }));
}

export async function triggerSheetsSyncDb(ctx: TenantContext) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-sheets");
  await prisma.integration.update({
    where: { id: row.id },
    data: { status: "SYNCING" },
  });
  return getIntegrationById(ctx, "google-sheets");
}

export async function completeSheetsSyncDb(
  ctx: TenantContext,
  message: string,
  rowsSynced: number,
) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-sheets");
  await prisma.integrationSyncLog.create({
    data: {
      integration: { connect: { id: row.id } },
      result: "SUCCESS",
      rowsSynced,
      message,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });
  await prisma.integration.update({
    where: { id: row.id },
    data: { status: "CONNECTED", lastSyncAt: new Date() },
  });
  return getIntegrationById(ctx, "google-sheets");
}

export async function getCalendarsDb(ctx: TenantContext) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-calendar");
  const config = parseConfig(row.config);
  return (config as { calendars?: unknown[] }).calendars ?? [];
}

export async function getCalendarConfigDb(ctx: TenantContext) {
  const integration = await getIntegrationById(ctx, "google-calendar");
  return integration?.calendarConfig ?? { ...DEFAULT_CALENDAR_CONFIG };
}

export async function getSheetRowsDb(ctx: TenantContext): Promise<SheetRow[]> {
  const row = await getOrCreateIntegration(ctx.companyId, "google-sheets");
  return parseConfig(row.config).sheetRows ?? [];
}

export async function readSheetRowDb(ctx: TenantContext, rowIndex: number) {
  const rows = await getSheetRowsDb(ctx);
  return rows[rowIndex] ?? null;
}

export async function writeSheetRowDb(
  ctx: TenantContext,
  rowIndex: number,
  data: SheetRow,
) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-sheets");
  const config = parseConfig(row.config);
  const sheetRows = [...(config.sheetRows ?? [])];
  sheetRows[rowIndex] = data;
  await mergeConfig(ctx, "google-sheets", { sheetRows });
  return data;
}

const TOOL_DEFAULTS: Record<AgentToolId, AgentToolAssignment> = {
  faq: {
    toolId: "faq",
    enabled: false,
    status: "disabled",
    health: "healthy",
    config: DEFAULT_FAQ_CONFIG,
    usage: { totalExecutions: 0, successRate: 1, lastUsedAt: null, errorCount: 0 },
  },
  billing: {
    toolId: "billing",
    enabled: false,
    status: "disabled",
    health: "healthy",
    config: DEFAULT_BILLING_CONFIG,
    usage: { totalExecutions: 0, successRate: 1, lastUsedAt: null, errorCount: 0 },
  },
  "google-calendar": {
    toolId: "google-calendar",
    enabled: false,
    status: "disabled",
    health: "healthy",
    config: DEFAULT_CALENDAR_TOOL_CONFIG,
    usage: { totalExecutions: 0, successRate: 1, lastUsedAt: null, errorCount: 0 },
  },
  "google-sheets": {
    toolId: "google-sheets",
    enabled: false,
    status: "disabled",
    health: "healthy",
    config: DEFAULT_SHEETS_TOOL_CONFIG,
    usage: { totalExecutions: 0, successRate: 1, lastUsedAt: null, errorCount: 0 },
  },
};

export async function getCalendarEventsDb(ctx: TenantContext) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-calendar");
  return (parseConfig(row.config).calendarEvents ?? []) as {
    id: string;
    title: string;
    start: string;
    end: string;
    attendeeEmail?: string;
  }[];
}

export async function addCalendarEventDb(
  ctx: TenantContext,
  event: Omit<{ id: string; title: string; start: string; end: string; attendeeEmail?: string }, "id">,
) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-calendar");
  const config = parseConfig(row.config);
  const created = { ...event, id: `evt-${Date.now()}` };
  const calendarEvents = [...(config.calendarEvents ?? []), created];
  await mergeConfig(ctx, "google-calendar", { calendarEvents });
  return created;
}

export async function updateCalendarEventDb(
  ctx: TenantContext,
  eventId: string,
  update: Partial<{ title: string; start: string; end: string; attendeeEmail?: string }>,
) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-calendar");
  const config = parseConfig(row.config);
  const events = [...(config.calendarEvents ?? [])] as {
    id: string;
    title: string;
    start: string;
    end: string;
    attendeeEmail?: string;
  }[];
  const index = events.findIndex((e) => e.id === eventId);
  if (index === -1) return null;
  events[index] = { ...events[index], ...update };
  await mergeConfig(ctx, "google-calendar", { calendarEvents: events });
  return events[index];
}

export async function deleteCalendarEventDb(ctx: TenantContext, eventId: string) {
  const row = await getOrCreateIntegration(ctx.companyId, "google-calendar");
  const config = parseConfig(row.config);
  const events = ((config.calendarEvents ?? []) as { id: string }[]).filter(
    (e) => e.id !== eventId,
  );
  if (events.length === (config.calendarEvents ?? []).length) return false;
  await mergeConfig(ctx, "google-calendar", { calendarEvents: events });
  return true;
}

export async function getAgentToolsDb(ctx: TenantContext, agentId: string) {
  const rows = await integrationsManagementService.getAgentTools(ctx, agentId);
  const byId = new Map(rows.map((r) => [r.toolId, r]));
  return (Object.keys(TOOL_DEFAULTS) as AgentToolId[]).map((toolId) => {
    const row = byId.get(toolId);
    const defaults = TOOL_DEFAULTS[toolId];
    if (!row) return defaults;
    return {
      ...defaults,
      enabled: row.enabled,
      status: row.enabled ? "enabled" : "disabled",
      config: row.config as AgentToolAssignment["config"],
      usage: row.usage as AgentToolAssignment["usage"],
    } satisfies AgentToolAssignment;
  });
}

export async function updateAgentToolDb(
  ctx: TenantContext,
  agentId: string,
  toolId: AgentToolId,
  patch: Partial<AgentToolAssignment>,
) {
  const updated = await integrationsManagementService.updateAgentTool(ctx, agentId, toolId, {
    enabled: patch.enabled,
    config: patch.config as Record<string, unknown>,
  });
  const defaults = TOOL_DEFAULTS[toolId];
  return {
    ...defaults,
    enabled: updated.enabled,
    status: updated.enabled ? "enabled" : "disabled",
    config: updated.config as AgentToolAssignment["config"],
    usage: updated.usage as AgentToolAssignment["usage"],
    health: patch.health ?? defaults.health,
  } satisfies AgentToolAssignment;
}
