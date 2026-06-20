import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import {
  createSpreadsheetDb,
  getSpreadsheetsDb,
} from "@/lib/integrations/db-state";

export async function GET() {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const spreadsheets = await getSpreadsheetsDb(ctx);
  return NextResponse.json({ spreadsheets });
}

export async function POST(req: Request) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const body = (await req.json()) as { name?: string };
  const name =
    body.name?.trim() ||
    `PropNex Sheet ${new Date().toLocaleDateString()}`;
  const spreadsheet = await createSpreadsheetDb(ctx, name);

  return NextResponse.json({ spreadsheet });
}
