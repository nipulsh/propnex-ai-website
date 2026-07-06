import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import {
  completeSheetsSyncDb,
  syncSheetsDataDb,
  triggerSheetsSyncDb,
} from "@/lib/integrations/db-state";

export async function POST() {
  const { error, ctx } = await requireIntegrationsWrite();
  if (error || !ctx) return error!;

  try {
    await triggerSheetsSyncDb(ctx);
    const rowsSynced = await syncSheetsDataDb(ctx);
    const integration = await completeSheetsSyncDb(
      ctx,
      `Synced ${rowsSynced} row(s) successfully`,
      rowsSynced,
    );
    return NextResponse.json({ integration });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    const integration = await completeSheetsSyncDb(ctx, message, 0, "error");
    return NextResponse.json({ error: message, integration }, { status: 500 });
  }
}
