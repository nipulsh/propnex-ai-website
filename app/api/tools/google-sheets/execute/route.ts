import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { readSheetRowDb, writeSheetRowDb } from "@/lib/integrations/db-state";
import type { SheetRow } from "@/lib/integrations/types";

export async function POST(req: Request) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const body = (await req.json()) as {
    action: "read" | "write";
    rowIndex: number;
    data?: SheetRow;
  };

  if (body.action === "read") {
    const row = await readSheetRowDb(ctx, body.rowIndex);
    return NextResponse.json({ row });
  }

  if (body.action === "write" && body.data) {
    const row = await writeSheetRowDb(ctx, body.rowIndex, body.data);
    return NextResponse.json({ row });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
