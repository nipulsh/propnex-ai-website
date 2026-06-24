import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { isGoogleIntegration } from "@/lib/integrations/google/constants";
import { connectIntegrationDb } from "@/lib/integrations/db-state";
import type { IntegrationId } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const { id } = await params;

  if (isGoogleIntegration(id as IntegrationId)) {
    return NextResponse.json(
      { error: "Use Google OAuth to connect this integration" },
      { status: 400 },
    );
  }

  const integration = await connectIntegrationDb(ctx, id as IntegrationId);
  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
