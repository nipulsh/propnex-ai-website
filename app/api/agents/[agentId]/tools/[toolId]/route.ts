import { NextResponse } from "next/server";

import { delay, requireAuth } from "@/lib/api/auth";
import { updateAgentTool } from "@/lib/api/integration-state";
import type { AgentToolAssignment, AgentToolId } from "@/lib/tools/types";

type RouteParams = { params: Promise<{ agentId: string; toolId: string }> };

export async function PUT(req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { agentId, toolId } = await params;
  const body = (await req.json()) as Partial<AgentToolAssignment>;

  const tool = updateAgentTool(agentId, toolId as AgentToolId, body);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  return NextResponse.json({ tool });
}

export async function POST(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { agentId, toolId } = await params;
  await delay(800);

  const tool = updateAgentTool(agentId, toolId as AgentToolId, {
    health: "healthy",
    usage: {
      totalExecutions: 1,
      successRate: 1,
      lastUsedAt: new Date().toISOString(),
      errorCount: 0,
    },
  });

  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  return NextResponse.json({ tool, testResult: "passed" });
}
