import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { getWorksheetsDb } from "@/lib/integrations/db-state";

export async function GET(req: Request) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const spreadsheetId = new URL(req.url).searchParams.get("spreadsheetId");
  if (!spreadsheetId) {
    return NextResponse.json({ error: "spreadsheetId required" }, { status: 400 });
  }

  const worksheets = await getWorksheetsDb(ctx, spreadsheetId);
  return NextResponse.json({ worksheets });
}
