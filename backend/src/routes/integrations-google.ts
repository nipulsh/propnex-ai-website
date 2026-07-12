import { Router } from "express";

import { requireIntegrationsRead, requireIntegrationsWrite } from "@/lib/integrations/api-guard";
import { isGoogleIntegration } from "@/lib/integrations/google/constants";
import {
  completeSheetsSyncDb,
  connectIntegrationDb,
  createSpreadsheetDb,
  deleteSpreadsheetDb,
  getCalendarsDb,
  getIntegrationById,
  getSpreadsheetsDb,
  getSyncHistoryDb,
  getWorksheetsDb,
  syncSheetsDataDb,
  triggerSheetsSyncDb,
  updateCalendarConfigDb,
  updateSheetsConfigDb,
} from "@/lib/integrations/db-state";
import {
  getClerkGoogleAccessToken,
  getClerkGoogleEmail,
  hasRequiredGoogleScopes,
  userHasGoogleAccount,
} from "@/lib/integrations/google/clerk-auth";
import { markGoogleIntegrationsConnected } from "@/lib/integrations/google/auth-status";
import { GoogleSheetsScopeError } from "@/lib/integrations/google/client";
import {
  buildGoogleAuthUrl,
  exchangeGoogleAuthCode,
  parseGoogleOAuthState,
} from "@/lib/integrations/google/oauth";
import { getSheetHeaders } from "@/lib/integrations/google/sheets-service";
import { saveGoogleTokens } from "@/lib/integrations/google/token-store";
import type { ColumnMapping, GoogleCalendarConfig, GoogleSheetsConfig, IntegrationId } from "@/lib/integrations/types";
import { DEFAULT_WORKING_HOURS } from "@/lib/integrations/types";
import { resolveTenantContext } from "@/middleware/tenant";
import type { TenantContext } from "@/server/types/context";

const frontendUrl = () => process.env.FRONTEND_URL ?? "http://localhost:3000";

export const integrationsGoogleRouter = Router();

// ── Calendar ────────────────────────────────────────────────────────────────

integrationsGoogleRouter.get("/calendar/calendars", requireIntegrationsRead(), async (req, res) => {
  const calendars = await getCalendarsDb(req.tenant!);
  res.json({ calendars });
});

integrationsGoogleRouter.put(
  "/calendar/config",
  requireIntegrationsWrite(),
  async (req, res) => {
    const body = req.body as Partial<GoogleCalendarConfig>;
    const integration = await updateCalendarConfigDb(req.tenant!, {
      calendarId: body.calendarId ?? null,
      calendarName: body.calendarName ?? null,
      timezone: body.timezone ?? "Asia/Kolkata",
      workingHours: body.workingHours ?? DEFAULT_WORKING_HOURS,
      meetingDurationMinutes: body.meetingDurationMinutes ?? 30,
      bufferMinutes: body.bufferMinutes ?? 15,
    });
    if (!integration) {
      res.status(404).json({ error: "Integration not found" });
      return;
    }
    res.json({ integration });
  },
);

// ── Connect / OAuth ─────────────────────────────────────────────────────────

function oauthRedirectResponse(res: import("express").Response, ctx: TenantContext, integrationId: IntegrationId) {
  const oauthUrl = buildGoogleAuthUrl(ctx.companyId, integrationId);
  res.json({ oauthUrl, requiresOAuth: true });
}

integrationsGoogleRouter.post("/connect", requireIntegrationsWrite(), async (req, res) => {
  const ctx = req.tenant!;
  const body = (req.body ?? {}) as { integrationId?: IntegrationId };
  const integrationId = body.integrationId;

  if (!integrationId || !isGoogleIntegration(integrationId)) {
    res.status(400).json({ error: "integrationId must be google-sheets or google-calendar" });
    return;
  }

  const clerkUserId = ctx.clerkUserId;

  if (clerkUserId) {
    const hasGoogle = await userHasGoogleAccount(clerkUserId);
    const clerkToken = hasGoogle ? await getClerkGoogleAccessToken(clerkUserId) : null;

    if (clerkToken && hasRequiredGoogleScopes(clerkToken.scopes)) {
      const email = await getClerkGoogleEmail(clerkUserId);
      await markGoogleIntegrationsConnected(ctx, email, "clerk");
      const integration = await getIntegrationById(ctx, integrationId);

      if (!integration) {
        res.status(404).json({ error: "Integration not found" });
        return;
      }

      res.json({ integration, authSource: "clerk" });
      return;
    }
  }

  try {
    oauthRedirectResponse(res, ctx, integrationId);
  } catch (e) {
    res.status(500).json({
      error:
        e instanceof Error
          ? e.message
          : "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.",
    });
  }
});

integrationsGoogleRouter.get("/oauth/start", requireIntegrationsRead(), async (req, res) => {
  const integrationId = req.query.integrationId as IntegrationId | undefined;

  if (!integrationId || !isGoogleIntegration(integrationId)) {
    res.status(400).json({ error: "integrationId must be google-sheets or google-calendar" });
    return;
  }

  try {
    const url = buildGoogleAuthUrl(req.tenant!.companyId, integrationId);
    res.redirect(url);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Failed to start Google OAuth" });
  }
});

// Public: Google redirects here directly, so this route resolves its own tenant
// from the Clerk session cookie forwarded by the browser — not requireTenant().
integrationsGoogleRouter.get("/oauth/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;
  const oauthError = typeof req.query.error === "string" ? req.query.error : null;

  const settingsUrl = new URL("/settings", frontendUrl());
  settingsUrl.searchParams.set("tab", "integrations");

  if (oauthError) {
    settingsUrl.searchParams.set("oauth_error", oauthError);
    res.redirect(settingsUrl.toString());
    return;
  }

  if (!code || !state) {
    settingsUrl.searchParams.set("oauth_error", "missing_code");
    res.redirect(settingsUrl.toString());
    return;
  }

  try {
    const parsed = parseGoogleOAuthState(state);
    const ctx = await resolveTenantContext(req);

    if (!ctx || ctx.companyId !== parsed.companyId) {
      settingsUrl.searchParams.set("oauth_error", "unauthorized");
      res.redirect(settingsUrl.toString());
      return;
    }

    const tokens = await exchangeGoogleAuthCode(code);
    await saveGoogleTokens(ctx, tokens);
    await connectIntegrationDb(ctx, parsed.integrationId, tokens.email ?? undefined);

    const otherId = parsed.integrationId === "google-sheets" ? "google-calendar" : "google-sheets";
    await connectIntegrationDb(ctx, otherId, tokens.email ?? undefined);

    settingsUrl.searchParams.set("oauth_success", parsed.integrationId);
    res.redirect(settingsUrl.toString());
  } catch (e) {
    settingsUrl.searchParams.set("oauth_error", e instanceof Error ? e.message : "oauth_failed");
    res.redirect(settingsUrl.toString());
  }
});

// ── Sheets ──────────────────────────────────────────────────────────────────

integrationsGoogleRouter.put("/sheets/config", requireIntegrationsWrite(), async (req, res) => {
  const body = req.body as Partial<GoogleSheetsConfig>;
  const integration = await updateSheetsConfigDb(req.tenant!, {
    spreadsheetId: body.spreadsheetId ?? null,
    spreadsheetName: body.spreadsheetName ?? null,
    worksheetId: body.worksheetId ?? null,
    worksheetName: body.worksheetName ?? null,
    columnMappings: body.columnMappings ?? [],
    autoSync: body.autoSync ?? false,
    lastSyncResult: body.lastSyncResult ?? null,
    lastSyncMessage: body.lastSyncMessage ?? null,
  });
  if (!integration) {
    res.status(404).json({ error: "Integration not found" });
    return;
  }
  res.json({ integration });
});

integrationsGoogleRouter.get("/sheets/headers", requireIntegrationsRead(), async (req, res) => {
  const spreadsheetId = req.query.spreadsheetId as string | undefined;
  const worksheetName = (req.query.worksheetName as string | undefined) ?? "Sheet1";

  if (!spreadsheetId) {
    res.status(400).json({ error: "spreadsheetId required" });
    return;
  }

  try {
    const headers = await getSheetHeaders(req.tenant!, spreadsheetId, worksheetName);
    res.json({ headers });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Failed to fetch headers" });
  }
});

integrationsGoogleRouter.post(
  "/sheets/spreadsheets/create",
  requireIntegrationsWrite(),
  async (req, res) => {
    const body = req.body as { name?: string };
    const name = body.name?.trim() || `PropNex Sheet ${new Date().toLocaleDateString()}`;
    const spreadsheet = await createSpreadsheetDb(req.tenant!, name);
    res.json({ spreadsheet });
  },
);

integrationsGoogleRouter
  .route("/sheets/spreadsheets")
  .get(requireIntegrationsRead(), async (req, res) => {
    try {
      const spreadsheets = await getSpreadsheetsDb(req.tenant!);
      res.json({ spreadsheets });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Failed to list spreadsheets" });
    }
  })
  .post(requireIntegrationsWrite(), async (req, res) => {
    const body = req.body as { name?: string; columns?: ColumnMapping[] };
    const name = body.name?.trim() || `PropNex Sheet ${new Date().toLocaleDateString()}`;

    try {
      const spreadsheet = await createSpreadsheetDb(req.tenant!, name, body.columns ?? []);
      res.json({ spreadsheet });
    } catch (e) {
      const status = e instanceof GoogleSheetsScopeError ? 400 : 500;
      res.status(status).json({ error: e instanceof Error ? e.message : "Failed to create spreadsheet" });
    }
  })
  .delete(requireIntegrationsWrite(), async (req, res) => {
    const spreadsheetId = req.query.spreadsheetId as string | undefined;
    if (!spreadsheetId) {
      res.status(400).json({ error: "spreadsheetId required" });
      return;
    }

    try {
      const integration = await deleteSpreadsheetDb(req.tenant!, spreadsheetId);
      const spreadsheets = await getSpreadsheetsDb(req.tenant!);
      res.json({ integration, spreadsheets });
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : "Failed to delete spreadsheet" });
    }
  });

integrationsGoogleRouter.post("/sheets/sync", requireIntegrationsWrite(), async (req, res) => {
  const ctx = req.tenant!;
  try {
    await triggerSheetsSyncDb(ctx);
    const rowsSynced = await syncSheetsDataDb(ctx);
    const integration = await completeSheetsSyncDb(ctx, `Synced ${rowsSynced} row(s) successfully`, rowsSynced);
    res.json({ integration });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    const integration = await completeSheetsSyncDb(ctx, message, 0, "error");
    res.status(500).json({ error: message, integration });
  }
});

integrationsGoogleRouter.get("/sheets/sync-history", requireIntegrationsRead(), async (req, res) => {
  const history = await getSyncHistoryDb(req.tenant!);
  res.json({ history });
});

integrationsGoogleRouter.get("/sheets/worksheets", requireIntegrationsRead(), async (req, res) => {
  const spreadsheetId = req.query.spreadsheetId as string | undefined;
  if (!spreadsheetId) {
    res.status(400).json({ error: "spreadsheetId required" });
    return;
  }
  const worksheets = await getWorksheetsDb(req.tenant!, spreadsheetId);
  res.json({ worksheets });
});

