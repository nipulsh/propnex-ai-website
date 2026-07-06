import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import { getWorksheetsDb } from "@/lib/integrations/db-state";

export async function GET(req: Request) {
  const { error, ctx } = await requireIntegrationsRead();
  if (error || !ctx) return error!;

  const spreadsheetId = new URL(req.url).searchParams.get("spreadsheetId");
  if (!spreadsheetId) {
    return NextResponse.json({ error: "spreadsheetId required" }, { status: 400 });
  }

  const worksheets = await getWorksheetsDb(ctx, spreadsheetId);
  return NextResponse.json({ worksheets });
}
