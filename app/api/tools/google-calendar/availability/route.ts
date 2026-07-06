import { NextResponse } from "next/server";

import {
  requireAgentsRead,
  requireAgentsWrite,
} from "@/lib/integrations/api-guard";
import { getCalendarConfigDb } from "@/lib/integrations/db-state";

export async function POST() {
  const { error, ctx } = await requireAgentsWrite();
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
