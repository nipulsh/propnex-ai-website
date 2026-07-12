import { Router } from "express";
import { Webhook } from "svix";

import { cacheService } from "@/server/cache/cache.service";
import { gqlDebug, gqlLogError } from "@/server/graphql/debug";
import { isClerkWebhooksEnabled } from "@/server/lib/clerk-config";
import { logResolutionEvent } from "@/server/lib/resolution-metrics";
import prisma from "@/server/lib/prisma";
import { handleClerkWebhookEvent } from "@/server/services/clerk-provision.service";

export const webhooksRouter = Router();

// Mounted with express.raw() in index.ts — svix needs the exact raw bytes to verify the signature.
webhooksRouter.post("/clerk", async (req, res) => {
  if (!isClerkWebhooksEnabled()) {
    res.json({
      received: true,
      skipped: true,
      reason: "Clerk webhooks disabled; use direct API provisioning in dev",
    });
    return;
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).json({
      error: "CLERK_WEBHOOKS_ENABLED is true but CLERK_WEBHOOK_SECRET is missing",
    });
    return;
  }

  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (
    typeof svixId !== "string" ||
    typeof svixTimestamp !== "string" ||
    typeof svixSignature !== "string"
  ) {
    res.status(400).json({ error: "Missing svix headers" });
    return;
  }

  const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
  const wh = new Webhook(webhookSecret);

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch {
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  const start = performance.now();

  try {
    await handleClerkWebhookEvent(event.type, event.data);
  } catch (error) {
    gqlLogError("clerk:webhook:handler-failed", error, { type: event.type });
    res.status(500).json({ error: "Webhook handler failed" });
    return;
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

      const user = await prisma.user.findUnique({ where: { clerkUserId } });
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

  res.json({ received: true });
});
