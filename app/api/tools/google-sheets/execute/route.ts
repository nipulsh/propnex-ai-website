import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import {
  appendSheetRowDb,
  readSheetRowDb,
  writeSheetRowDb,
} from "@/lib/integrations/db-state";
import type { SheetRow } from "@/lib/integrations/types";

export async function POST(req: Request) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const body = (await req.json()) as {
    action: "read" | "write" | "append" | "update";
    rowIndex?: number;
    data?: SheetRow;
  };

  try {
    if (body.action === "read") {
      if (body.rowIndex === undefined) {
        return NextResponse.json({ error: "rowIndex required" }, { status: 400 });
      }
      const row = await readSheetRowDb(ctx, body.rowIndex);
      return NextResponse.json({ row });
    }

    if (body.action === "append" && body.data) {
      const row = await appendSheetRowDb(ctx, body.data);
      return NextResponse.json({ row });
    }

    if (
      (body.action === "write" || body.action === "update") &&
      body.data &&
      body.rowIndex !== undefined
    ) {
      const row = await writeSheetRowDb(ctx, body.rowIndex, body.data);
      return NextResponse.json({ row });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Execute failed" },
      { status: 500 },
    );
  }
}
