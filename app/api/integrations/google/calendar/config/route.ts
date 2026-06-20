import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import { updateCalendarConfigDb } from "@/lib/integrations/db-state";
import {
  DEFAULT_WORKING_HOURS,
  type GoogleCalendarConfig,
} from "@/lib/integrations/types";

export async function PUT(req: Request) {
  const { error, ctx } = await requireTenantContext();
  if (error || !ctx) return error!;

  const body = (await req.json()) as Partial<GoogleCalendarConfig>;
  const integration = await updateCalendarConfigDb(ctx, {
    calendarId: body.calendarId ?? null,
    calendarName: body.calendarName ?? null,
    timezone: body.timezone ?? "Asia/Kolkata",
    workingHours: body.workingHours ?? DEFAULT_WORKING_HOURS,
    meetingDurationMinutes: body.meetingDurationMinutes ?? 30,
    bufferMinutes: body.bufferMinutes ?? 15,
  });

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
