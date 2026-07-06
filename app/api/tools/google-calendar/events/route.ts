import { NextResponse } from "next/server";

import {
  requireAgentsRead,
  requireAgentsWrite,
} from "@/lib/integrations/api-guard";
import {
  addCalendarEventDb,
  deleteCalendarEventDb,
  getCalendarEventsDb,
  updateCalendarEventDb,
} from "@/lib/integrations/db-state";

export async function POST(req: Request) {
  const { error, ctx } = await requireAgentsWrite();
  if (error || !ctx) return error!;

  const body = (await req.json()) as {
    action: "create" | "reschedule" | "cancel" | "list";
    eventId?: string;
    title?: string;
    start?: string;
    end?: string;
    attendeeEmail?: string;
  };

  switch (body.action) {
    case "list":
      return NextResponse.json({ events: await getCalendarEventsDb(ctx) });
    case "create": {
      const event = await addCalendarEventDb(ctx, {
        title: body.title ?? "Appointment",
        start: body.start ?? new Date().toISOString(),
        end: body.end ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        attendeeEmail: body.attendeeEmail,
      });
      return NextResponse.json({ event });
    }
    case "reschedule": {
      if (!body.eventId) {
        return NextResponse.json({ error: "eventId required" }, { status: 400 });
      }
      const event = await updateCalendarEventDb(ctx, body.eventId, {
        start: body.start,
        end: body.end,
      });
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json({ event });
    }
    case "cancel": {
      if (!body.eventId) {
        return NextResponse.json({ error: "eventId required" }, { status: 400 });
      }
      const deleted = await deleteCalendarEventDb(ctx, body.eventId);
      if (!deleted) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
