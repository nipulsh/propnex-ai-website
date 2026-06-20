import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createDataLoaders } from "@/server/graphql/dataloaders";
import { isAppError } from "@/server/lib/errors";
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

  const customPermissions = membership.customRole?.permissions ?? [];
  const permissions = await tenantService.getPermissions(
    user.id,
    membership.role,
    customPermissions,
  );

  return {
    userId: user.id,
    clerkUserId: userId,
    companyId: company.id,
    role: membership.role,
    permissions,
    loaders: createDataLoaders(company.id),
  };
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
