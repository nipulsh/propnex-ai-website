import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { updateSheetsConfigDb } from "@/lib/integrations/db-state";
import type { GoogleSheetsConfig } from "@/lib/integrations/types";

export async function PUT(req: Request) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const body = (await req.json()) as Partial<GoogleSheetsConfig>;
  const integration = await updateSheetsConfigDb(ctx, {
    spreadsheetId: body.spreadsheetId ?? null,
    spreadsheetName: body.spreadsheetName ?? null,
    worksheetId: body.worksheetId ?? null,
    worksheetName: body.worksheetName ?? null,
    columnMappings: body.columnMappings ?? [],
    autoSync: body.autoSync ?? false,
    lastSyncResult: body.lastSyncResult ?? null,
    lastSyncMessage: body.lastSyncMessage ?? null,
  });

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
