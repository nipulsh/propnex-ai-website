import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { getSyncHistoryDb } from "@/lib/integrations/db-state";

export async function GET() {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const history = await getSyncHistoryDb(ctx);
  return NextResponse.json({ history });
}
