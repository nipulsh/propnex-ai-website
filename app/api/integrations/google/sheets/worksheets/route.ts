import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getWorksheets } from "@/lib/api/integration-state";

export async function GET(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get("spreadsheetId");
  if (!spreadsheetId) {
    return NextResponse.json(
      { error: "spreadsheetId is required" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    worksheets: getWorksheets(spreadsheetId),
  });
}
