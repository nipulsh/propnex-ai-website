import { Router } from "express";
import { z } from "zod";

import { requireAuth, requirePermission, requireTenant } from "@/middleware/tenant";
import { PERMISSIONS } from "@/lib/permissions";
import { isAppError } from "@/server/lib/errors";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";
import { reconcileInviteMembershipOnLogin } from "@/server/services/clerk-provision.service";
import { companyService } from "@/server/services/company.service";
import { contractService } from "@/server/services/contract.service";

const tenantRepo = new TenantRepository(prisma);

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  title: z.string().optional(),
});

const linkContractSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
});

export const companyRouter = Router();

companyRouter.get("/contact", requireTenant(), async (req, res) => {
  try {
    const contact = await companyService.getContact(req.tenant!);
    res.json({ contact });
  } catch (err) {
    if (isAppError(err)) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

companyRouter.put(
  "/contact",
  requirePermission(PERMISSIONS.SETTINGS_WRITE),
  async (req, res) => {
    try {
      const body = contactSchema.parse(req.body);
      const contact = await companyService.upsertContact(req.tenant!, {
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || undefined,
        title: body.title?.trim() || undefined,
      });
      res.json({ contact });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.issues[0]?.message ?? err.message });
        return;
      }
      if (isAppError(err)) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

companyRouter.post("/contract/link", requireAuth(), async (req, res) => {
  try {
    const body = linkContractSchema.parse(req.body);
    const result = await contractService.linkContractId(req.clerkUserId!, body.contractId);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0]?.message ?? err.message });
      return;
    }
    if (isAppError(err)) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error("POST /company/contract/link failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

companyRouter.get("/contract", requireAuth(), async (req, res) => {
  const userId = req.clerkUserId!;

  try {
    const dbUser = await tenantRepo.findUserByClerkId(userId);
    if (dbUser) {
      const invitedMembership = await prisma.companyMember.findFirst({
        where: { userId: dbUser.id, status: "INVITED" },
      });
      const pendingBranchInvite = await prisma.branchInvitation.findFirst({
        where: {
          email: { equals: dbUser.email, mode: "insensitive" },
          status: "PENDING",
        },
      });
      if (invitedMembership || pendingBranchInvite) {
        // orgId isn't verified on this route (Clerk-only auth); pass undefined.
        await reconcileInviteMembershipOnLogin(userId, undefined);
      }
    }

    const status = await contractService.getContractLinkStatus(userId);
    res.json(status);
  } catch (err) {
    if (isAppError(err)) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
