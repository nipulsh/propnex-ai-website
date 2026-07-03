import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isAppError } from "@/server/lib/errors";
import { buildTenantContext } from "@/server/lib/tenant-context-builder";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";
import { syncTenantFromClerk } from "@/server/services/clerk-provision.service";
import { tenantService } from "@/server/services/tenant.service";
import type { TenantContext } from "@/server/types/context";

const tenantRepo = new TenantRepository(prisma);

export async function resolveTenantContext(): Promise<TenantContext | null> {
  const { userId, orgId } = await auth();
  if (!userId) return null;

  let company = null;
  if (orgId) {
    try {
      company = await tenantService.resolveCompany(orgId);
    } catch (error) {
      if (!isAppError(error) || error.statusCode !== 404) {
        throw error;
      }
    }
  }

  if (!company) {
    let user = await tenantRepo.findUserByClerkId(userId);
    if (!user) {
      user = await tenantService.ensureUserFromClerk(userId);
    }

    if (user) {
      const membership = await prisma.companyMember.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        include: { company: true },
        orderBy: { joinedAt: "desc" },
      });
      company = membership?.company ?? null;
    }
  }

  if (!company) {
    company = await syncTenantFromClerk(userId);
  }

  if (!company) return null;

  const { user, membership } = await tenantService.resolveMembership(
    company.id,
    userId,
  );

  return buildTenantContext(userId, company.id, membership);
}

export async function requireTenantContext() {
  const ctx = await resolveTenantContext();
  if (!ctx) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      ctx: null,
    };
  }
  return { error: null, ctx };
}
