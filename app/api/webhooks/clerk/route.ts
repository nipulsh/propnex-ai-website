import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { handleClerkWebhookEvent } from "@/server/services/clerk-provision.service";
import { isClerkWebhooksEnabled } from "@/server/lib/clerk-config";
import { cacheService } from "@/server/cache/cache.service";
import { gqlDebug, gqlLogError } from "@/server/graphql/debug";
import { logResolutionEvent } from "@/server/lib/resolution-metrics";

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

  const start = performance.now();

  try {
    await handleClerkWebhookEvent(event.type, event.data);
  } catch (error) {
    gqlLogError("clerk:webhook:handler-failed", error, { type: event.type });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  const durationMs = Math.round(performance.now() - start);

  if (
    event.type === "organizationMembership.created" ||
    event.type === "organizationMembership.updated" ||
    event.type === "organizationMembership.deleted"
  ) {
    const clerkUserId = event.data.public_user_data
      ? (event.data.public_user_data as { user_id: string }).user_id
      : (event.data.user_id as string);
    const orgId = event.data.organization_id as string | undefined;

    if (clerkUserId) {
      await cacheService.invalidateClerkMembershipCaches(clerkUserId, orgId);

      const prisma = (await import("@/server/lib/prisma")).default;
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
      });
      if (user) {
        await cacheService.invalidateUserPermissions(user.id);
      }
    }

    logResolutionEvent("clerk:webhook:membership", {
      type: event.type,
      clerkUserId,
      orgId,
      durationMs,
    });
  } else {
    gqlDebug("clerk:webhook:processed", { type: event.type, durationMs });
  }

  return NextResponse.json({ received: true });
}
