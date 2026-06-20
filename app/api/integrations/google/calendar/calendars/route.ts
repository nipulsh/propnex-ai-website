import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { getCalendarsDb } from "@/lib/integrations/db-state";

export async function GET() {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const calendars = await getCalendarsDb(ctx);
  return NextResponse.json({ calendars });
}
