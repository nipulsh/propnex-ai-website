import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import { createSpreadsheetDb } from "@/lib/integrations/db-state";

export async function POST(req: Request) {
  const { error, ctx } = await requireIntegrationsWrite();
  if (error || !ctx) return error!;

  const body = (await req.json()) as { name?: string };
  const name = body.name?.trim() || `PropNex Sheet ${new Date().toLocaleDateString()}`;
  const spreadsheet = await createSpreadsheetDb(ctx, name);
  return NextResponse.json({ spreadsheet });
}
