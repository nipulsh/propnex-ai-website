import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import {
  addCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from "@/lib/api/integration-state";

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

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
      return NextResponse.json({ events: getCalendarEvents() });
    case "create": {
      const event = addCalendarEvent({
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
      const event = updateCalendarEvent(body.eventId, {
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
      const deleted = deleteCalendarEvent(body.eventId);
      if (!deleted) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
