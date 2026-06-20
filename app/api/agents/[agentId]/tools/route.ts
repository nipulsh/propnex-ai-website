import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { getAgentToolsDb } from "@/lib/integrations/db-state";

type RouteParams = { params: Promise<{ agentId: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const { agentId } = await params;
  const tools = await getAgentToolsDb(ctx, agentId);
  return NextResponse.json({ tools });
}
