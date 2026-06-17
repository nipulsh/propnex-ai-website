import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { updateCalendarConfig } from "@/lib/api/integration-state";
import type { GoogleCalendarConfig } from "@/lib/integrations/types";

export async function PUT(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await req.json()) as Partial<GoogleCalendarConfig>;
  const integration = updateCalendarConfig(body);

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
