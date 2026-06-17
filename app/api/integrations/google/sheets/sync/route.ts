import { NextResponse } from "next/server";

import { delay, requireAuth } from "@/lib/api/auth";
import {
  completeSync,
  setIntegrationSyncing,
} from "@/lib/api/integration-state";

export async function POST() {
  const { error } = await requireAuth();
  if (error) return error;

  setIntegrationSyncing("google-sheets");
  await delay(2000);

  const integration = completeSync(
    "google-sheets",
    "success",
    "All rows synced successfully",
    248,
  );

  return NextResponse.json({ integration });
}
