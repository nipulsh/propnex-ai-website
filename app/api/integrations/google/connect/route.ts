import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import { getIntegrationById } from "@/lib/integrations/db-state";
import {
  getClerkGoogleAccessToken,
  getClerkGoogleEmail,
  hasRequiredGoogleScopes,
  userHasGoogleAccount,
} from "@/lib/integrations/google/clerk-auth";
import { markGoogleIntegrationsConnected } from "@/lib/integrations/google/auth-status";
import { buildGoogleAuthUrl } from "@/lib/integrations/google/oauth";
import type { IntegrationId } from "@/lib/integrations/types";
import { isGoogleIntegration } from "@/lib/integrations/google/constants";
import type { TenantContext } from "@/server/types/context";

function oauthRedirectResponse(
  ctx: TenantContext,
  integrationId: IntegrationId,
) {
  const oauthUrl = buildGoogleAuthUrl(ctx.companyId, integrationId);
  return NextResponse.json({ oauthUrl, requiresOAuth: true });
}

export async function POST(req: Request) {
  const { error, ctx } = await requireIntegrationsWrite();
  if (error || !ctx) return error!;

  const body = (await req.json().catch(() => ({}))) as {
    integrationId?: IntegrationId;
  };
  const integrationId = body.integrationId;

  if (!integrationId || !isGoogleIntegration(integrationId)) {
    return NextResponse.json(
      { error: "integrationId must be google-sheets or google-calendar" },
      { status: 400 },
    );
  }

  const clerkUserId = ctx.clerkUserId;

  if (clerkUserId) {
    const hasGoogle = await userHasGoogleAccount(clerkUserId);
    const clerkToken = hasGoogle
      ? await getClerkGoogleAccessToken(clerkUserId)
      : null;

    if (
      clerkToken &&
      hasRequiredGoogleScopes(clerkToken.scopes)
    ) {
      const email = await getClerkGoogleEmail(clerkUserId);
      await markGoogleIntegrationsConnected(ctx, email, "clerk");
      const integration = await getIntegrationById(ctx, integrationId);

      if (!integration) {
        return NextResponse.json(
          { error: "Integration not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ integration, authSource: "clerk" });
    }
  }

  try {
    return oauthRedirectResponse(ctx, integrationId);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.",
      },
      { status: 500 },
    );
  }
}
