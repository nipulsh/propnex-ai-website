import { randomUUID } from "node:crypto";

import type {
  BranchAccessType,
  MemberStatus,
  UserRole,
} from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

import { cacheService } from "@/server/cache/cache.service";
import { cacheKeys } from "@/server/cache/keys";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/lib/errors";
import { mapUserRoleToClerkRole } from "@/server/lib/clerk-sync";
import prisma from "@/server/lib/prisma";
import {
  EmployeesRepository,
  type EmployeeFilter,
  type EmployeeRow,
} from "@/server/repositories/employees.repository";
import { branchAccessService } from "@/server/services/branch-access.service";
import { tenantService } from "@/server/services/tenant.service";
import { buildConnection, encodeIdCursor } from "@/server/lib/pagination";
import type { TenantContext } from "@/server/types/context";
import {
  getPermissionsForRole,
  PERMISSIONS,
} from "@/server/types/permissions";

function displayName(user: EmployeeRow["user"]) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.email;
}

function mapEmployee(row: EmployeeRow) {
  return {
    id: row.id,
    userId: row.userId,
    name: displayName(row.user),
    email: row.user.email,
    phone: row.user.phone,
    imageUrl: row.user.imageUrl,
    jobTitle: row.jobTitle,
    role: row.role,
    customRole: row.customRole
      ? {
          id: row.customRole.id,
          name: row.customRole.name,
          slug: row.customRole.slug,
          permissions: row.customRole.permissions,
          isSystem: row.customRole.isSystem,
        }
      : null,
    branchAccessType: row.branchAccessType,
    assignedBranches:
      row.branchAccessType === "ALL"
        ? []
        : row.branchAccess.map((access) => ({
            id: access.branch.id,
            name: access.branch.name,
            status: access.branch.status,
          })),
    status: row.status,
    lastActiveAt: row.user.lastLoginAt?.toISOString() ?? null,
    invitedAt: row.invitedAt?.toISOString() ?? null,
    joinedAt: row.joinedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function validateBranchAccessInput(
  repo: EmployeesRepository,
  companyId: string,
  branchAccessType: BranchAccessType,
  branchIds: string[] | undefined,
  ctx: TenantContext,
) {
  if (branchAccessType === "ALL") return [];

  const ids = branchIds ?? [];
  if (ids.length === 0) {
    throw new ValidationError("Select at least one branch");
  }

  branchAccessService.assertBranchIdsAccess(ctx, ids);

  const valid = await repo.validateBranchIds(companyId, ids);
  if (valid.length !== ids.length) {
    throw new ValidationError("One or more branches are invalid");
  }

  return ids;
}

function assertCanManageTarget(
  ctx: TenantContext,
  target: EmployeeRow,
  action: "update" | "deactivate" | "delete",
) {
  if (target.id === ctx.membershipId) {
    throw new ForbiddenError(`You cannot ${action} your own account`);
  }

  if (target.role === "OWNER" && ctx.role !== "OWNER") {
    throw new ForbiddenError("Only owners can manage owner accounts");
  }
}

export type EmployeeConnectionArgs = {
  first?: number;
  after?: string;
  filter?: EmployeeFilter;
};

export class EmployeesService {
  private readonly repo = new EmployeesRepository(prisma);

  async getConnection(ctx: TenantContext, args: EmployeeConnectionArgs) {
    tenantService.requirePermission(ctx, PERMISSIONS.EMPLOYEES_READ);
    const limit = Math.min(Math.max(args.first ?? 25, 1), 200);

    const [rows, totalCount] = await Promise.all([
      this.repo.findConnection(ctx.companyId, limit, args.after, args.filter),
      this.repo.count(ctx.companyId, args.filter),
    ]);

    const connection = buildConnection(rows, limit, (row) =>
      encodeIdCursor(row.id, row.createdAt),
    );

    return {
      edges: connection.edges.map((edge) => ({
        node: mapEmployee(edge.node),
        cursor: edge.cursor,
      })),
      pageInfo: connection.pageInfo,
      totalCount,
    };
  }

  async getById(ctx: TenantContext, id: string) {
    tenantService.requirePermission(ctx, PERMISSIONS.EMPLOYEES_READ);
    const row = await this.repo.findById(ctx.companyId, id);
    if (!row) throw new NotFoundError("Employee not found");
    return mapEmployee(row);
  }

  getPermissionsForRole(_ctx: TenantContext, role: UserRole) {
    tenantService.requirePermission(_ctx, PERMISSIONS.EMPLOYEES_READ);
    return getPermissionsForRole(role);
  }

  async invite(
    ctx: TenantContext,
    input: {
      name: string;
      email: string;
      role: UserRole;
      jobTitle?: string | null;
      branchAccessType: BranchAccessType;
      branchIds?: string[] | null;
    },
  ) {
    tenantService.requirePermission(ctx, PERMISSIONS.EMPLOYEES_INVITE);

    if (input.role === "OWNER" && ctx.role !== "OWNER") {
      throw new ForbiddenError("Only owners can invite other owners");
    }

    const email = input.email.trim().toLowerCase();
    if (!email) throw new ValidationError("Email is required");

    const existing = await this.repo.findByEmail(ctx.companyId, email);
    if (existing && existing.status !== "REMOVED") {
      throw new ValidationError("An employee with this email already exists");
    }

    const branchIds = await validateBranchAccessInput(
      this.repo,
      ctx.companyId,
      input.branchAccessType,
      input.branchIds ?? undefined,
      ctx,
    );

    const company = await prisma.company.findUnique({
      where: { id: ctx.companyId },
    });
    if (!company?.clerkOrganizationId?.startsWith("org_")) {
      throw new ValidationError(
        "Organization invitations require Clerk Organizations to be enabled",
      );
    }

    const [firstName, ...rest] = input.name.trim().split(/\s+/);
    const lastName = rest.join(" ") || null;

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.repo.createInvitation({
      companyId: ctx.companyId,
      email,
      role: input.role,
      jobTitle: input.jobTitle ?? null,
      branchAccessType: input.branchAccessType,
      branchIds,
      token,
      expiresAt,
      invitedById: ctx.userId,
    });

    const client = await clerkClient();
    await client.organizations.createOrganizationInvitation({
      organizationId: company.clerkOrganizationId,
      emailAddress: email,
      role: mapUserRoleToClerkRole(input.role),
      publicMetadata: {
        propnexRole: input.role,
        branchAccessType: input.branchAccessType,
        branchIds,
        jobTitle: input.jobTitle ?? null,
        inviteName: input.name,
      },
    });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: `pending:${token}`,
          email,
          firstName: firstName || null,
          lastName,
          status: "INVITED",
        },
      });
    } else if (firstName || lastName) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
        },
      });
    }

    const member = await prisma.companyMember.upsert({
      where: {
        companyId_userId: { companyId: ctx.companyId, userId: user.id },
      },
      create: {
        companyId: ctx.companyId,
        userId: user.id,
        role: input.role,
        status: "INVITED",
        jobTitle: input.jobTitle ?? null,
        branchAccessType: input.branchAccessType,
        invitedAt: new Date(),
      },
      update: {
        role: input.role,
        status: "INVITED",
        jobTitle: input.jobTitle ?? null,
        branchAccessType: input.branchAccessType,
        invitedAt: new Date(),
      },
      include: {
        user: true,
        customRole: true,
        branchAccess: { include: { branch: true } },
      },
    });

    if (input.branchAccessType === "SELECTED") {
      await this.repo.setBranchAccess(member.id, branchIds);
    } else {
      await this.repo.setBranchAccess(member.id, []);
    }

    const refreshed = await this.repo.findById(ctx.companyId, member.id);
    return mapEmployee(refreshed!);
  }

  async update(
    ctx: TenantContext,
    id: string,
    input: {
      jobTitle?: string | null;
      role?: UserRole;
      branchAccessType?: BranchAccessType;
      branchIds?: string[] | null;
      status?: MemberStatus;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
    },
  ) {
    tenantService.requirePermission(ctx, PERMISSIONS.EMPLOYEES_WRITE);

    const existing = await this.repo.findById(ctx.companyId, id);
    if (!existing) throw new NotFoundError("Employee not found");

    assertCanManageTarget(ctx, existing, "update");

    if (input.role === "OWNER" && ctx.role !== "OWNER") {
      throw new ForbiddenError("Only owners can assign the owner role");
    }

    if (existing.role === "OWNER" && input.role && input.role !== "OWNER") {
      const owners = await this.repo.countActiveOwners(ctx.companyId, id);
      if (owners === 0) {
        throw new ValidationError("At least one active owner is required");
      }
    }

    const branchAccessType = input.branchAccessType ?? existing.branchAccessType;
    const branchIds = await validateBranchAccessInput(
      this.repo,
      ctx.companyId,
      branchAccessType,
      input.branchIds ?? existing.branchAccess.map((b) => b.branchId),
      ctx,
    );

    if (input.firstName !== undefined || input.lastName !== undefined || input.phone !== undefined) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: {
          ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
          ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
          ...(input.phone !== undefined ? { phone: input.phone } : {}),
        },
      });
    }

    const updated = await this.repo.updateMember(ctx.companyId, id, {
      ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.status ? { status: input.status } : {}),
      branchAccessType,
      ...(input.status === "ACTIVE" && !existing.joinedAt
        ? { joinedAt: new Date() }
        : {}),
    });

    if (branchAccessType === "SELECTED") {
      await this.repo.setBranchAccess(id, branchIds);
    } else {
      await this.repo.setBranchAccess(id, []);
    }

    await cacheService.del(cacheKeys.userPermissions(existing.userId));

    if (
      input.role &&
      existing.user.clerkUserId &&
      !existing.user.clerkUserId.startsWith("pending:")
    ) {
      const company = await prisma.company.findUnique({
        where: { id: ctx.companyId },
      });
      if (company?.clerkOrganizationId?.startsWith("org_")) {
        const client = await clerkClient();
        try {
          const memberships =
            await client.organizations.getOrganizationMembershipList({
              organizationId: company.clerkOrganizationId,
              limit: 100,
            });
          const clerkMembership = memberships.data.find(
            (m) => m.publicUserData?.userId === existing.user.clerkUserId,
          );
          if (clerkMembership) {
            await client.organizations.updateOrganizationMembership({
              organizationId: company.clerkOrganizationId,
              userId: existing.user.clerkUserId,
              role: mapUserRoleToClerkRole(input.role),
            });
          }
        } catch {
          // Clerk sync is best-effort
        }
      }
    }

    const refreshed = await this.repo.findById(ctx.companyId, id);
    return mapEmployee(refreshed!);
  }

  async deactivate(ctx: TenantContext, id: string) {
    return this.update(ctx, id, { status: "DEACTIVATED" });
  }

  async delete(ctx: TenantContext, id: string) {
    tenantService.requirePermission(ctx, PERMISSIONS.EMPLOYEES_WRITE);

    const existing = await this.repo.findById(ctx.companyId, id);
    if (!existing) throw new NotFoundError("Employee not found");

    assertCanManageTarget(ctx, existing, "delete");

    if (existing.role === "OWNER") {
      const owners = await this.repo.countActiveOwners(ctx.companyId, id);
      if (owners === 0) {
        throw new ValidationError("At least one active owner is required");
      }
    }

    await this.repo.updateMember(ctx.companyId, id, { status: "REMOVED" });
    await this.repo.setBranchAccess(id, []);
    await cacheService.del(cacheKeys.userPermissions(existing.userId));

    const company = await prisma.company.findUnique({
      where: { id: ctx.companyId },
    });
    if (
      company?.clerkOrganizationId?.startsWith("org_") &&
      existing.user.clerkUserId &&
      !existing.user.clerkUserId.startsWith("pending:")
    ) {
      const client = await clerkClient();
      try {
        await client.organizations.deleteOrganizationMembership({
          organizationId: company.clerkOrganizationId,
          userId: existing.user.clerkUserId,
        });
      } catch {
        // best-effort
      }
    }

    return true;
  }

  async resendInvite(ctx: TenantContext, id: string) {
    tenantService.requirePermission(ctx, PERMISSIONS.EMPLOYEES_INVITE);

    const existing = await this.repo.findById(ctx.companyId, id);
    if (!existing) throw new NotFoundError("Employee not found");
    if (existing.status !== "INVITED") {
      throw new ValidationError("Only invited employees can be re-invited");
    }

    const company = await prisma.company.findUnique({
      where: { id: ctx.companyId },
    });
    if (!company?.clerkOrganizationId?.startsWith("org_")) {
      throw new ValidationError(
        "Organization invitations require Clerk Organizations to be enabled",
      );
    }

    const client = await clerkClient();
    await client.organizations.createOrganizationInvitation({
      organizationId: company.clerkOrganizationId,
      emailAddress: existing.user.email,
      role: mapUserRoleToClerkRole(existing.role),
      publicMetadata: {
        propnexRole: existing.role,
        branchAccessType: existing.branchAccessType,
        branchIds: existing.branchAccess.map((b) => b.branchId),
        jobTitle: existing.jobTitle,
      },
    });

    return mapEmployee(existing);
  }
}

export const employeesService = new EmployeesService();
