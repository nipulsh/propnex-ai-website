import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import { isGoogleIntegration } from "@/lib/integrations/google/constants";
import { buildGoogleAuthUrl } from "@/lib/integrations/google/oauth";
import type { IntegrationId } from "@/lib/integrations/types";

export async function GET(req: Request) {
  const { error, ctx } = await requireIntegrationsRead();
  if (error || !ctx) return error!;

  const integrationId = new URL(req.url).searchParams.get(
    "integrationId",
  ) as IntegrationId | null;

  if (!integrationId || !isGoogleIntegration(integrationId)) {
    return NextResponse.json(
      { error: "integrationId must be google-sheets or google-calendar" },
      { status: 400 },
    );
  }

  try {
    const url = buildGoogleAuthUrl(ctx.companyId, integrationId);
    return NextResponse.redirect(url);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Failed to start Google OAuth",
      },
      { status: 500 },
    );
  }
}
