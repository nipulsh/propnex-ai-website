import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import { getSheetHeaders } from "@/lib/integrations/google/sheets-service";

export async function GET(req: Request) {
  const { error, ctx } = await requireIntegrationsRead();
  if (error || !ctx) return error!;

  const url = new URL(req.url);
  const spreadsheetId = url.searchParams.get("spreadsheetId");
  const worksheetName = url.searchParams.get("worksheetName") ?? "Sheet1";

  if (!spreadsheetId) {
    return NextResponse.json({ error: "spreadsheetId required" }, { status: 400 });
  }

  try {
    const headers = await getSheetHeaders(ctx, spreadsheetId, worksheetName);
    return NextResponse.json({ headers });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch headers" },
      { status: 500 },
    );
  }
}
