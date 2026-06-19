import { auth } from "@clerk/nextjs/server";

import { createDataLoaders } from "@/server/graphql/dataloaders";
import { UnauthorizedError } from "@/server/lib/errors";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";
import { tenantService } from "@/server/services/tenant.service";
import type { GraphQLContext } from "@/server/types/context";

const tenantRepo = new TenantRepository(prisma);

export async function createGraphQLContext(): Promise<GraphQLContext> {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  let company = orgId
    ? await tenantService.resolveCompany(orgId)
    : null;

  if (!company) {
    const user = await tenantRepo.findUserByClerkId(userId);
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
    throw new UnauthorizedError("Organization context required");
  }

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
    isAuthenticated: true,
    userId: user.id,
    clerkUserId: userId,
    companyId: company.id,
    role: membership.role,
    permissions,
    loaders: createDataLoaders(company.id),
  };
}
