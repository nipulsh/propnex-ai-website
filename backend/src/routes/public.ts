import { Router } from "express";
import rateLimit from "express-rate-limit";

import { clerkClient } from "@/server/lib/clerk-client";
import { isAppError } from "@/server/lib/errors";
import { acceptBranchInvitation, getPublicBranchInvitation } from "@/server/services/branch-invitation.service";
import { requireAuth } from "@/middleware/tenant";

export const publicRouter = Router();

const invitationLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

publicRouter.get("/branch-invitations/:token", invitationLimiter, async (req, res) => {
  const result = await getPublicBranchInvitation(req.params.token as string);
  res.json(result);
});

publicRouter.post(
  "/branch-invitations/:token/accept",
  invitationLimiter,
  requireAuth(),
  async (req, res) => {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(req.clerkUserId!);
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) {
        res.status(400).json({ error: "No email address on file" });
        return;
      }

      const result = await acceptBranchInvitation({
        token: req.params.token as string,
        clerkUserId: req.clerkUserId!,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });

      if (result.clerkOrganizationId && !result.clerkOrganizationId.startsWith("local:")) {
        try {
          await client.organizations.createOrganizationMembership({
            organizationId: result.clerkOrganizationId,
            userId: req.clerkUserId!,
            role: "org:admin",
          });
        } catch (err) {
          console.error("[Clerk Org Invite Error]", err);
        }
      }

      res.json({ success: true, ...result });
    } catch (err) {
      if (isAppError(err)) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  },
);
