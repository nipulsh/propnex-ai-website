import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import { GoogleSheetsScopeError } from "@/lib/integrations/google/client";
import type { ColumnMapping } from "@/lib/integrations/types";
import {
  createSpreadsheetDb,
  deleteSpreadsheetDb,
  getSpreadsheetsDb,
} from "@/lib/integrations/db-state";

export async function GET() {
  const { error, ctx } = await requireIntegrationsRead();
  if (error || !ctx) return error!;

  try {
    const spreadsheets = await getSpreadsheetsDb(ctx);
    return NextResponse.json({ spreadsheets });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list spreadsheets" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { error, ctx } = await requireIntegrationsWrite();
  if (error || !ctx) return error!;

  const body = (await req.json()) as {
    name?: string;
    columns?: ColumnMapping[];
  };
  const name =
    body.name?.trim() ||
    `PropNex Sheet ${new Date().toLocaleDateString()}`;

  try {
    const spreadsheet = await createSpreadsheetDb(
      ctx,
      name,
      body.columns ?? [],
    );
    return NextResponse.json({ spreadsheet });
  } catch (e) {
    const status = e instanceof GoogleSheetsScopeError ? 400 : 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create spreadsheet" },
      { status },
    );
  }
}

export async function DELETE(req: Request) {
  const { error, ctx } = await requireIntegrationsWrite();
  if (error || !ctx) return error!;

  const spreadsheetId = new URL(req.url).searchParams.get("spreadsheetId");
  if (!spreadsheetId) {
    return NextResponse.json({ error: "spreadsheetId required" }, { status: 400 });
  }

  try {
    const integration = await deleteSpreadsheetDb(ctx, spreadsheetId);
    const spreadsheets = await getSpreadsheetsDb(ctx);
    return NextResponse.json({ integration, spreadsheets });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete spreadsheet" },
      { status: 500 },
    );
  }
}
