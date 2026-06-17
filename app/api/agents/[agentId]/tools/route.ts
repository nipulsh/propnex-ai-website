import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getAgentTools } from "@/lib/api/integration-state";

type RouteParams = { params: Promise<{ agentId: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { agentId } = await params;
  return NextResponse.json({ tools: getAgentTools(agentId) });
}
