import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { getIntegrationById } from "@/lib/integrations/db-state";
import type { IntegrationId } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const { id } = await params;
  const integration = await getIntegrationById(ctx, id as IntegrationId);
  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
