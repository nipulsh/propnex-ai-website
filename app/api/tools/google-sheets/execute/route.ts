import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { readSheetRow, writeSheetRow } from "@/lib/api/integration-state";

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await req.json()) as {
    action: "read" | "write";
    phone?: string;
    name?: string;
    data?: Record<string, string>;
  };

  if (body.action === "read") {
    const row = readSheetRow({ phone: body.phone, name: body.name });
    if (!row) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ row });
  }

  const row = writeSheetRow(body.data ?? {}, {
    phone: body.phone,
    name: body.name,
  });
  return NextResponse.json({ row });
}
