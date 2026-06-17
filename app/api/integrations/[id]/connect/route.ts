import { NextResponse } from "next/server";

import { delay, requireAuth } from "@/lib/api/auth";
import { connectIntegration } from "@/lib/api/integration-state";
import type { IntegrationId } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await delay(1500);

  const integration = connectIntegration(id as IntegrationId);
  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
