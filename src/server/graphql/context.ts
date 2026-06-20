import { auth } from "@clerk/nextjs/server";

import { gqlDebug, gqlDebugTimed } from "@/server/graphql/debug";
import { createDataLoaders } from "@/server/graphql/dataloaders";
import { isAppError, UnauthorizedError } from "@/server/lib/errors";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";
import { syncTenantFromClerk } from "@/server/services/clerk-provision.service";
import { tenantService } from "@/server/services/tenant.service";
import type { GraphQLContext } from "@/server/types/context";

const tenantRepo = new TenantRepository(prisma);

export async function createGraphQLContext(): Promise<GraphQLContext> {
  return gqlDebugTimed("context:total", async () => {
    const { userId, orgId } = await gqlDebugTimed("context:auth", () => auth());
    gqlDebug("context:auth", { hasUserId: Boolean(userId), hasOrgId: Boolean(orgId) });

    if (!userId) {
      throw new UnauthorizedError();
    }

    let company = null;
    if (orgId) {
      try {
        company = await gqlDebugTimed("context:resolveCompany", () =>
          tenantService.resolveCompany(orgId),
        );
        gqlDebug("context:resolveCompany", { orgId, companyFound: Boolean(company) });
      } catch (error) {
        if (!isAppError(error) || error.statusCode !== 404) {
          throw error;
        }
        gqlDebug("context:resolveCompany", {
          orgId,
          companyFound: false,
          fallback: true,
        });
      }
    }

    if (!company) {
      let user = await gqlDebugTimed("context:findUser", () =>
        tenantRepo.findUserByClerkId(userId),
      );

      if (!user) {
        user = await gqlDebugTimed("context:syncUser", () =>
          tenantService.ensureUserFromClerk(userId),
        );
      }

      gqlDebug("context:fallbackMembership", { dbUserFound: Boolean(user) });

      if (user) {
        const membership = await gqlDebugTimed("context:membership", () =>
          prisma.companyMember.findFirst({
            where: { userId: user.id, status: "ACTIVE" },
            include: { company: true },
            orderBy: { joinedAt: "desc" },
          }),
        );
        company = membership?.company ?? null;
        gqlDebug("context:fallbackMembership", {
          dbUserFound: true,
          companyFound: Boolean(company),
        });
      }
    }

    if (!company) {
      company = await gqlDebugTimed("context:syncTenant", () =>
        syncTenantFromClerk(userId),
      );
      gqlDebug("context:syncTenant", { companyFound: Boolean(company) });
    }

    if (!company) {
      gqlDebug("context:noCompany", { orgId, hasUserId: Boolean(userId) });
      throw new UnauthorizedError("Organization context required");
    }

    const { user, membership } = await gqlDebugTimed("context:resolveMembership", () =>
      tenantService.resolveMembership(company.id, userId),
    );

    const customPermissions = membership.customRole?.permissions ?? [];
    const permissions = await gqlDebugTimed("context:permissions", () =>
      tenantService.getPermissions(user.id, membership.role, customPermissions),
    );

    gqlDebug("context:done", {
      companyId: company.id,
      userId: user.id,
      role: membership.role,
    });

    return {
      isAuthenticated: true,
      userId: user.id,
      clerkUserId: userId,
      companyId: company.id,
      role: membership.role,
      permissions,
      loaders: createDataLoaders(company.id),
    };
  });
}
