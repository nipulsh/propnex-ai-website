import { INTEGRATION_DEFINITIONS } from "@/lib/integrations/registry";
import {
  MOCK_CALENDAR_EVENTS,
  MOCK_CALENDARS,
  MOCK_GOOGLE_ACCOUNT,
  MOCK_SHEET_ROWS,
  MOCK_SPREADSHEETS,
  MOCK_SYNC_HISTORY,
  MOCK_WORKSHEETS,
  type MockCalendarEvent,
} from "@/lib/integrations/mock-data";
import type {
  GoogleCalendarConfig,
  GoogleSheetsConfig,
  IntegrationId,
  SheetRow,
  SyncHistoryEntry,
  WorkspaceIntegration,
} from "@/lib/integrations/types";
import {
  DEFAULT_CALENDAR_CONFIG,
  DEFAULT_SHEETS_CONFIG,
} from "@/lib/integrations/types";
import { buildAllAgentToolDefaults } from "@/lib/tools/mock-data";
import type { AgentToolAssignment, AgentToolId } from "@/lib/tools/types";

function createDefaultIntegration(
  id: IntegrationId,
  name: string,
): WorkspaceIntegration {
  const base: WorkspaceIntegration = {
    id,
    name,
    status: "not_connected",
    connectedAccount: null,
    lastSyncAt: null,
    errorMessage: null,
  };

  if (id === "google-sheets") {
    return { ...base, sheetsConfig: { ...DEFAULT_SHEETS_CONFIG } };
  }
  if (id === "google-calendar") {
    return { ...base, calendarConfig: { ...DEFAULT_CALENDAR_CONFIG } };
  }
  return base;
}

const initialIntegrations: WorkspaceIntegration[] =
  INTEGRATION_DEFINITIONS.filter((d) => d.available).map((d) =>
    createDefaultIntegration(d.id, d.name),
  );

let integrations: WorkspaceIntegration[] = structuredClone(initialIntegrations);
let syncHistory: SyncHistoryEntry[] = structuredClone(MOCK_SYNC_HISTORY);
let sheetRows: SheetRow[] = structuredClone(MOCK_SHEET_ROWS);
let calendarEvents: MockCalendarEvent[] = structuredClone(MOCK_CALENDAR_EVENTS);
let agentTools: Record<string, AgentToolAssignment[]> =
  buildAllAgentToolDefaults();

export function getIntegrations(): WorkspaceIntegration[] {
  return structuredClone(integrations);
}

export function getIntegration(id: IntegrationId): WorkspaceIntegration | null {
  const found = integrations.find((i) => i.id === id);
  return found ? structuredClone(found) : null;
}

export function connectIntegration(id: IntegrationId): WorkspaceIntegration | null {
  const idx = integrations.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  integrations[idx] = {
    ...integrations[idx],
    status: "connected",
    connectedAccount: MOCK_GOOGLE_ACCOUNT,
    errorMessage: null,
    lastSyncAt: new Date().toISOString(),
  };

  return structuredClone(integrations[idx]);
}

export function disconnectIntegration(id: IntegrationId): WorkspaceIntegration | null {
  const idx = integrations.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  const def = createDefaultIntegration(id, integrations[idx].name);
  integrations[idx] = def;
  return structuredClone(integrations[idx]);
}

export function setIntegrationSyncing(id: IntegrationId): WorkspaceIntegration | null {
  const idx = integrations.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  integrations[idx] = { ...integrations[idx], status: "syncing" };
  return structuredClone(integrations[idx]);
}

export function completeSync(
  id: IntegrationId,
  result: "success" | "partial" | "error",
  message: string,
  rowsSynced: number,
): WorkspaceIntegration | null {
  const idx = integrations.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const entry: SyncHistoryEntry = {
    id: `sync-${Date.now()}`,
    startedAt: now,
    completedAt: now,
    result: result === "error" ? "error" : result,
    rowsSynced,
    message,
  };
  syncHistory = [entry, ...syncHistory].slice(0, 20);

  const integration = integrations[idx];
  if (integration.sheetsConfig) {
    integration.sheetsConfig = {
      ...integration.sheetsConfig,
      lastSyncResult: result === "error" ? "error" : result,
      lastSyncMessage: message,
    };
  }

  integrations[idx] = {
    ...integration,
    status: result === "error" ? "error" : "connected",
    lastSyncAt: now,
    errorMessage: result === "error" ? message : null,
  };

  return structuredClone(integrations[idx]);
}

export function updateSheetsConfig(
  config: Partial<GoogleSheetsConfig>,
): WorkspaceIntegration | null {
  const idx = integrations.findIndex((i) => i.id === "google-sheets");
  if (idx === -1) return null;

  integrations[idx] = {
    ...integrations[idx],
    sheetsConfig: {
      ...(integrations[idx].sheetsConfig ?? DEFAULT_SHEETS_CONFIG),
      ...config,
    },
  };

  return structuredClone(integrations[idx]);
}

export function updateCalendarConfig(
  config: Partial<GoogleCalendarConfig>,
): WorkspaceIntegration | null {
  const idx = integrations.findIndex((i) => i.id === "google-calendar");
  if (idx === -1) return null;

  integrations[idx] = {
    ...integrations[idx],
    calendarConfig: {
      ...(integrations[idx].calendarConfig ?? DEFAULT_CALENDAR_CONFIG),
      ...config,
    },
  };

  return structuredClone(integrations[idx]);
}

export function getSyncHistory(): SyncHistoryEntry[] {
  return structuredClone(syncHistory);
}

export function getSpreadsheets() {
  return structuredClone(MOCK_SPREADSHEETS);
}

export function createSpreadsheet(name: string) {
  const newSheet = {
    id: `sheet-${Date.now()}`,
    name,
    modifiedAt: new Date().toISOString(),
  };
  MOCK_SPREADSHEETS.unshift(newSheet);
  MOCK_WORKSHEETS[newSheet.id] = [
    { id: `ws-${Date.now()}`, name: "Sheet1", rowCount: 0 },
  ];
  return newSheet;
}

export function getWorksheets(spreadsheetId: string) {
  return structuredClone(MOCK_WORKSHEETS[spreadsheetId] ?? []);
}

export function getCalendars() {
  return structuredClone(MOCK_CALENDARS);
}

export function getAgentTools(agentId: string): AgentToolAssignment[] {
  if (!agentTools[agentId]) {
    agentTools[agentId] = buildAllAgentToolDefaults()[agentId] ?? [];
  }
  return structuredClone(applyIntegrationGating(agentId, agentTools[agentId]));
}

function applyIntegrationGating(
  _agentId: string,
  tools: AgentToolAssignment[],
): AgentToolAssignment[] {
  const sheetsConnected =
    integrations.find((i) => i.id === "google-sheets")?.status === "connected";
  const calendarConnected =
    integrations.find((i) => i.id === "google-calendar")?.status === "connected";

  return tools.map((tool) => {
    if (tool.toolId === "google-sheets" && !sheetsConnected) {
      return {
        ...tool,
        health: "unavailable" as const,
        blockedReason: "Connect Google Sheets in Settings > Integrations",
      };
    }
    if (tool.toolId === "google-calendar" && !calendarConnected) {
      return {
        ...tool,
        health: "unavailable" as const,
        blockedReason: "Connect Google Calendar in Settings > Integrations",
      };
    }
    if (tool.enabled && tool.health === "unavailable") {
      return { ...tool, health: "healthy" as const, blockedReason: undefined };
    }
    return tool;
  });
}

export function updateAgentTool(
  agentId: string,
  toolId: AgentToolId,
  update: Partial<AgentToolAssignment>,
): AgentToolAssignment | null {
  if (!agentTools[agentId]) {
    agentTools[agentId] = buildAllAgentToolDefaults()[agentId] ?? [];
  }

  const idx = agentTools[agentId].findIndex((t) => t.toolId === toolId);
  if (idx === -1) return null;

  const merged = {
    ...agentTools[agentId][idx],
    ...update,
    status: (update.enabled ?? agentTools[agentId][idx].enabled)
      ? ("enabled" as const)
      : ("disabled" as const),
  };

  agentTools[agentId][idx] = merged;
  const gated = applyIntegrationGating(agentId, agentTools[agentId]);
  agentTools[agentId] = gated;
  return structuredClone(gated.find((t) => t.toolId === toolId) ?? null);
}

export function readSheetRow(query: {
  phone?: string;
  name?: string;
}): SheetRow | null {
  const row = sheetRows.find((r) => {
    if (query.phone && r["Phone Number"]?.includes(query.phone.replace(/\D/g, "").slice(-10))) {
      return true;
    }
    if (query.name && r["Customer Name"]?.toLowerCase().includes(query.name.toLowerCase())) {
      return true;
    }
    return false;
  });
  return row ? structuredClone(row) : null;
}

export function writeSheetRow(
  data: Partial<SheetRow>,
  query?: { phone?: string; name?: string },
): SheetRow {
  if (query) {
    const idx = sheetRows.findIndex((r) => {
      if (query.phone) return r["Phone Number"] === query.phone;
      if (query.name) return r["Customer Name"] === query.name;
      return false;
    });
    if (idx !== -1) {
      sheetRows[idx] = { ...sheetRows[idx], ...data } as SheetRow;
      return structuredClone(sheetRows[idx]);
    }
  }
  const newRow: SheetRow = {
    "Customer Name": data["Customer Name"] ?? "Unknown",
    "Phone Number": data["Phone Number"] ?? "",
    Budget: data.Budget ?? "",
    "Lead Status": data["Lead Status"] ?? "New",
    "Follow-Up Date": data["Follow-Up Date"] ?? "",
    Notes: data.Notes ?? "",
    "Call Outcome": data["Call Outcome"] ?? "",
    "AI Summary": data["AI Summary"] ?? "",
    "Lead Score": data["Lead Score"] ?? "",
    Temperature: data.Temperature ?? "",
  };
  sheetRows.push(newRow);
  return structuredClone(newRow);
}

export function getCalendarEvents() {
  return structuredClone(calendarEvents);
}

export function addCalendarEvent(event: Omit<MockCalendarEvent, "id">) {
  const newEvent = { ...event, id: `evt-${Date.now()}` };
  calendarEvents.push(newEvent);
  return structuredClone(newEvent);
}

export function updateCalendarEvent(
  id: string,
  update: Partial<MockCalendarEvent>,
) {
  const idx = calendarEvents.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  calendarEvents[idx] = { ...calendarEvents[idx], ...update };
  return structuredClone(calendarEvents[idx]);
}

export function deleteCalendarEvent(id: string) {
  const idx = calendarEvents.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  calendarEvents.splice(idx, 1);
  return true;
}

export function getCalendarConfig(): GoogleCalendarConfig {
  const integration = integrations.find((i) => i.id === "google-calendar");
  return structuredClone(integration?.calendarConfig ?? DEFAULT_CALENDAR_CONFIG);
}
