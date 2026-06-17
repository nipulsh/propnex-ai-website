import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getCalendarConfig } from "@/lib/api/integration-state";

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await req.json()) as { date?: string };
  const config = getCalendarConfig();
  const targetDate = body.date ?? new Date().toISOString().split("T")[0];

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const;
  const dayOfWeek = dayNames[new Date(targetDate).getDay()];
  const hours = config.workingHours[dayOfWeek];

  if (!hours.enabled) {
    return NextResponse.json({ slots: [], message: "No working hours on this day" });
  }

  const slots: string[] = [];
  const [startH] = hours.start.split(":").map(Number);
  const [endH] = hours.end.split(":").map(Number);
  const duration = config.meetingDurationMinutes + config.bufferMinutes;

  for (let h = startH; h + duration / 60 <= endH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (duration <= 60) slots.push(`${String(h).padStart(2, "0")}:30`);
  }

  return NextResponse.json({
    slots,
    timezone: config.timezone,
    meetingDurationMinutes: config.meetingDurationMinutes,
  });
}
