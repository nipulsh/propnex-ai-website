import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import { getSyncHistoryDb } from "@/lib/integrations/db-state";

export async function GET() {
  const { error, ctx } = await requireIntegrationsRead();
  if (error || !ctx) return error!;

  const history = await getSyncHistoryDb(ctx);
  return NextResponse.json({ history });
}
