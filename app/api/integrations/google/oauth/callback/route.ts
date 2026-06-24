import { NextResponse } from "next/server";

import { resolveTenantContext } from "@/lib/api/tenant-context";
import { connectIntegrationDb } from "@/lib/integrations/db-state";
import {
  exchangeGoogleAuthCode,
  parseGoogleOAuthState,
} from "@/lib/integrations/google/oauth";
import { saveGoogleTokens } from "@/lib/integrations/google/token-store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const settingsUrl = new URL("/settings", url.origin);
  settingsUrl.searchParams.set("tab", "integrations");

  if (oauthError) {
    settingsUrl.searchParams.set("oauth_error", oauthError);
    return NextResponse.redirect(settingsUrl);
  }

  if (!code || !state) {
    settingsUrl.searchParams.set("oauth_error", "missing_code");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const parsed = parseGoogleOAuthState(state);
    const ctx = await resolveTenantContext();

    if (!ctx || ctx.companyId !== parsed.companyId) {
      settingsUrl.searchParams.set("oauth_error", "unauthorized");
      return NextResponse.redirect(settingsUrl);
    }

    const tokens = await exchangeGoogleAuthCode(code);
    await saveGoogleTokens(ctx, tokens);
    await connectIntegrationDb(ctx, parsed.integrationId, tokens.email ?? undefined);

    const otherId =
      parsed.integrationId === "google-sheets"
        ? "google-calendar"
        : "google-sheets";
    await connectIntegrationDb(ctx, otherId, tokens.email ?? undefined);

    settingsUrl.searchParams.set("oauth_success", parsed.integrationId);
    return NextResponse.redirect(settingsUrl);
  } catch (e) {
    settingsUrl.searchParams.set(
      "oauth_error",
      e instanceof Error ? e.message : "oauth_failed",
    );
    return NextResponse.redirect(settingsUrl);
  }
}
