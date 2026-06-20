import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { getCalendarConfigDb } from "@/lib/integrations/db-state";

export async function POST() {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const config = await getCalendarConfigDb(ctx);
  return NextResponse.json({
    available: true,
    timezone: config.timezone,
    workingHours: config.workingHours,
    meetingDurationMinutes: config.meetingDurationMinutes,
    bufferMinutes: config.bufferMinutes,
  });
}
