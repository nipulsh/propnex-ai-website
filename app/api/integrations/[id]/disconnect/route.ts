import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { disconnectIntegrationDb } from "@/lib/integrations/db-state";
import type { IntegrationId } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const { id } = await params;
  const integration = await disconnectIntegrationDb(ctx, id as IntegrationId);
  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
