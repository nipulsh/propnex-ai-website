import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { handleClerkWebhookEvent } from "@/server/services/clerk-provision.service";
import { isClerkWebhooksEnabled } from "@/server/lib/clerk-config";
import { cacheService } from "@/server/cache/cache.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isClerkWebhooksEnabled()) {
    return NextResponse.json({
      received: true,
      skipped: true,
      reason: "Clerk webhooks disabled; use direct API provisioning in dev",
    });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOKS_ENABLED is true but CLERK_WEBHOOK_SECRET is missing" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await request.text();
  const wh = new Webhook(webhookSecret);

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleClerkWebhookEvent(event.type, event.data);
  } catch (error) {
    console.error("Clerk webhook handler failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  if (
    event.type === "organizationMembership.created" ||
    event.type === "organizationMembership.updated" ||
    event.type === "organizationMembership.deleted"
  ) {
    const clerkUserId = event.data.public_user_data
      ? (event.data.public_user_data as { user_id: string }).user_id
      : (event.data.user_id as string);
    if (clerkUserId) {
      const prisma = (await import("@/server/lib/prisma")).default;
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
      });
      if (user) {
        await cacheService.invalidateUserPermissions(user.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
