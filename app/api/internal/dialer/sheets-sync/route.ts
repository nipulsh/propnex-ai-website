import { NextResponse } from "next/server";

import { validateAgentServerRequest } from "@/lib/api/agent-server-auth";
import { createServiceTenantContext } from "@/lib/api/service-tenant-context";
import { syncDialerCallToSheetDb } from "@/lib/integrations/db-state";

export async function POST(req: Request) {
  const { companyId, error } = validateAgentServerRequest(req);
  if (error) return error;

  const body = (await req.json()) as { callId?: string };
  const callId = body.callId?.trim();
  if (!callId) {
    return NextResponse.json({ error: "callId is required" }, { status: 400 });
  }

  try {
    const ctx = createServiceTenantContext(companyId);
    const result = await syncDialerCallToSheetDb(ctx, callId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sheets sync failed" },
      { status: 500 },
    );
  }
}
