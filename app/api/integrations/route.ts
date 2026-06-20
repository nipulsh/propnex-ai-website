import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { listIntegrations } from "@/lib/integrations/db-state";

export async function GET() {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const integrations = await listIntegrations(ctx);
  return NextResponse.json({ integrations });
}
