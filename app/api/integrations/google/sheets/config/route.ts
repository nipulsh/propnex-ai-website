import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { updateSheetsConfig } from "@/lib/api/integration-state";
import type { GoogleSheetsConfig } from "@/lib/integrations/types";

export async function PUT(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await req.json()) as Partial<GoogleSheetsConfig>;
  const integration = updateSheetsConfig(body);

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
