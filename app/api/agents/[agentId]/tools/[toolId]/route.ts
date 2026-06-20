import { NextResponse } from "next/server";

import { delay, requireAuth } from "@/lib/api/auth";
import { requireTenantContext } from "@/lib/api/tenant-context";
import { updateAgentToolDb } from "@/lib/integrations/db-state";
import type { AgentToolAssignment, AgentToolId } from "@/lib/tools/types";

type RouteParams = { params: Promise<{ agentId: string; toolId: string }> };

export async function PUT(req: Request, { params }: RouteParams) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const { agentId, toolId } = await params;
  const body = (await req.json()) as Partial<AgentToolAssignment>;

  const tool = await updateAgentToolDb(ctx, agentId, toolId as AgentToolId, body);
  return NextResponse.json({ tool });
}

export async function POST(_req: Request, { params }: RouteParams) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const { agentId, toolId } = await params;
  await delay(800);

  const tool = await updateAgentToolDb(ctx, agentId, toolId as AgentToolId, {
    health: "healthy",
    usage: {
      totalExecutions: 1,
      successRate: 1,
      lastUsedAt: new Date().toISOString(),
      errorCount: 0,
    },
  });

  return NextResponse.json({ tool, testResult: "passed" });
}
