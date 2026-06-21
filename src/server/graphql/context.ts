import { auth } from "@clerk/nextjs/server";

import { gqlDebug, gqlLog, gqlLogTimed } from "@/server/graphql/debug";
import { createDataLoaders } from "@/server/graphql/dataloaders";
import { isAppError, UnauthorizedError } from "@/server/lib/errors";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";
import { syncTenantFromClerk } from "@/server/services/clerk-provision.service";
import { tenantService } from "@/server/services/tenant.service";
import type { GraphQLContext } from "@/server/types/context";

const tenantRepo = new TenantRepository(prisma);

export async function createGraphQLContext(): Promise<GraphQLContext> {
  return gqlLogTimed("context:total", async () => {
    const { userId, orgId } = await gqlLogTimed("context:auth", () => auth());
    gqlLog("context:auth:result", {
      hasUserId: Boolean(userId),
      hasOrgId: Boolean(orgId),
    });
    gqlDebug("context:auth", {
      hasUserId: Boolean(userId),
      hasOrgId: Boolean(orgId),
    });

    if (!userId) {
      gqlLog("context:auth:unauthorized", { reason: "missing userId" });
      throw new UnauthorizedError();
    }

    let company = null;
    if (orgId) {
      try {
        company = await gqlLogTimed("context:resolveCompany", () =>
          tenantService.resolveCompany(orgId),
        );
        gqlLog("context:resolveCompany:result", {
          orgId,
          companyFound: Boolean(company),
          companyId: company?.id,
        });
        gqlDebug("context:resolveCompany", {
          orgId,
          companyFound: Boolean(company),
        });
      } catch (error) {
        if (!isAppError(error) || error.statusCode !== 404) {
          gqlLog("context:resolveCompany:throw", {
            orgId,
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
        gqlLog("context:resolveCompany:fallback", { orgId });
        gqlDebug("context:resolveCompany", {
          orgId,
          companyFound: false,
          fallback: true,
        });
      }
    }

    if (!company) {
      let user = await gqlLogTimed("context:findUser", () =>
        tenantRepo.findUserByClerkId(userId),
      );
      gqlLog("context:findUser:result", { dbUserFound: Boolean(user) });

      if (!user) {
        user = await gqlLogTimed("context:syncUser", () =>
          tenantService.ensureUserFromClerk(userId),
        );
        gqlLog("context:syncUser:result", { dbUserFound: Boolean(user) });
      }

      gqlDebug("context:fallbackMembership", { dbUserFound: Boolean(user) });

      if (user) {
        const membership = await gqlLogTimed("context:membership", () =>
          prisma.companyMember.findFirst({
            where: { userId: user.id, status: "ACTIVE" },
            include: { company: true },
            orderBy: { joinedAt: "desc" },
          }),
        );
        company = membership?.company ?? null;
        gqlLog("context:membership:result", {
          dbUserFound: true,
          companyFound: Boolean(company),
          companyId: company?.id,
        });
        gqlDebug("context:fallbackMembership", {
          dbUserFound: true,
          companyFound: Boolean(company),
        });
      }
    }

    if (!company) {
      company = await gqlLogTimed("context:syncTenant", () =>
        syncTenantFromClerk(userId),
      );
      gqlLog("context:syncTenant:result", {
        companyFound: Boolean(company),
        companyId: company?.id,
      });
      gqlDebug("context:syncTenant", { companyFound: Boolean(company) });
    }

    if (!company) {
      gqlLog("context:noCompany", { orgId, hasUserId: Boolean(userId) });
      gqlDebug("context:noCompany", { orgId, hasUserId: Boolean(userId) });
      throw new UnauthorizedError("Organization context required");
    }

    const { user, membership } = await gqlLogTimed(
      "context:resolveMembership",
      () => tenantService.resolveMembership(company.id, userId),
    );
    gqlLog("context:resolveMembership:result", {
      userId: user.id,
      role: membership.role,
    });

    const customPermissions = membership.customRole?.permissions ?? [];
    const permissions = await gqlLogTimed("context:permissions", () =>
      tenantService.getPermissions(user.id, membership.role, customPermissions),
    );

    gqlLog("context:done", {
      companyId: company.id,
      userId: user.id,
      role: membership.role,
      permissionCount: permissions.length,
    });
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
