import { NextResponse } from "next/server";

import { delay, requireAuth } from "@/lib/api/auth";
import { requireTenantContext } from "@/lib/api/tenant-context";
import {
  completeSheetsSyncDb,
  triggerSheetsSyncDb,
} from "@/lib/integrations/db-state";

export async function POST() {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  await triggerSheetsSyncDb(ctx);
  await delay(2000);

  const integration = await completeSheetsSyncDb(
    ctx,
    "All rows synced successfully",
    0,
  );

  return NextResponse.json({ integration });
}
