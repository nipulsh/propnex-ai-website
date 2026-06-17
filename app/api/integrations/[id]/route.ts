import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getIntegration } from "@/lib/api/integration-state";
import type { IntegrationId } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const integration = getIntegration(id as IntegrationId);
  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
