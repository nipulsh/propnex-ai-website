import { NextResponse } from "next/server";

import { delay, requireAuth } from "@/lib/api/auth";
import { requireTenantContext } from "@/lib/api/tenant-context";
import { connectIntegrationDb } from "@/lib/integrations/db-state";
import type { IntegrationId } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const { id } = await params;
  await delay(1500);

  const integration = await connectIntegrationDb(ctx, id as IntegrationId);
  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
