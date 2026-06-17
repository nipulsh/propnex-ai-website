import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getCalendars } from "@/lib/api/integration-state";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  return NextResponse.json({ calendars: getCalendars() });
}
