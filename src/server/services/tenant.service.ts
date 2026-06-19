import { cacheService } from "@/server/cache/cache.service";
import { CACHE_TTL, cacheKeys } from "@/server/cache/keys";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/server/lib/errors";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";
import type { TenantContext } from "@/server/types/context";
import {
  getPermissionsForRole,
  hasPermission,
  mergePermissions,
  type Permission,
} from "@/server/types/permissions";

export class TenantService {
  private readonly repo = new TenantRepository(prisma);

  async resolveCompany(clerkOrgId: string | null | undefined) {
    if (!clerkOrgId) {
      throw new UnauthorizedError("Organization context required");
    }

    const company = await this.repo.findCompanyByClerkOrgId(clerkOrgId);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    return company;
  }

  async resolveMembership(companyId: string, clerkUserId: string) {
    const user = await this.repo.findUserByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const membership = await this.repo.findMembership(companyId, user.id);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("Not a member of this organization");
    }

    return { user, membership };
  }

  async getPermissions(
    userId: string,
    role: TenantContext["role"],
    customPermissions: string[] = [],
  ): Promise<string[]> {
    return cacheService.getOrSet(
      cacheKeys.userPermissions(userId),
      CACHE_TTL.PERMISSIONS,
      async () => {
        const rolePermissions = getPermissionsForRole(role);
        return mergePermissions(rolePermissions, customPermissions);
      },
    );
  }

  requirePermission(ctx: TenantContext, permission: Permission) {
    if (!hasPermission(ctx.permissions, permission)) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
  }

  async syncUserFromClerk(data: {
    clerkUserId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    phone?: string | null;
  }) {
    return this.repo.upsertUser(data);
  }

  async syncCompanyFromClerk(data: {
    clerkOrganizationId: string;
    name: string;
    slug: string;
    primaryUseCase?: string | null;
    callVolume?: string | null;
  }) {
    return this.repo.upsertCompany(data);
  }

  async syncMembership(data: {
    companyId: string;
    userId: string;
    role: TenantContext["role"];
  }) {
    return this.repo.upsertMembership(data);
  }

  async getViewer(ctx: TenantContext) {
    const membership = await this.repo.findMembership(ctx.companyId, ctx.userId);
    if (!membership) {
      throw new NotFoundError("Membership not found");
    }

    return {
      id: membership.user.id,
      email: membership.user.email,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      role: membership.role,
      company: {
        id: membership.company.id,
        name: membership.company.name,
        slug: membership.company.slug,
      },
    };
  }
}

export const tenantService = new TenantService();
