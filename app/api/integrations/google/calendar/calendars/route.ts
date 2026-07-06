import { NextResponse } from "next/server";

import {
  requireIntegrationsRead,
  requireIntegrationsWrite,
} from "@/lib/integrations/api-guard";
import { getCalendarsDb } from "@/lib/integrations/db-state";

export async function GET() {
  const { error, ctx } = await requireIntegrationsRead();
  if (error || !ctx) return error!;

  const calendars = await getCalendarsDb(ctx);
  return NextResponse.json({ calendars });
}
