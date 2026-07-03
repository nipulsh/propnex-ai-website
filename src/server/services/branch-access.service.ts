import type { BranchAccessType, Prisma } from "@prisma/client";

import { ForbiddenError } from "@/server/lib/errors";
import type { BranchAccessContext, TenantContext } from "@/server/types/context";

export function buildBranchAccessFromMember(data: {
  branchAccessType: BranchAccessType;
  branchAccess?: { branchId: string }[];
  role: TenantContext["role"];
}): BranchAccessContext {
  if (data.role === "OWNER" || data.branchAccessType === "ALL") {
    return { type: "ALL", branchIds: [] };
  }

  return {
    type: "SELECTED",
    branchIds: data.branchAccess?.map((row) => row.branchId) ?? [],
  };
}

export class BranchAccessService {
  hasAllBranchAccess(ctx: TenantContext): boolean {
    return ctx.role === "OWNER" || ctx.branchAccess.type === "ALL";
  }

  assertBranchAccess(ctx: TenantContext, branchId: string) {
    if (this.hasAllBranchAccess(ctx)) return;
    if (!ctx.branchAccess.branchIds.includes(branchId)) {
      throw new ForbiddenError("You do not have access to this branch");
    }
  }

  assertBranchIdsAccess(ctx: TenantContext, branchIds: string[]) {
    if (this.hasAllBranchAccess(ctx)) return;
    const allowed = new Set(ctx.branchAccess.branchIds);
    const denied = branchIds.filter((id) => !allowed.has(id));
    if (denied.length > 0) {
      throw new ForbiddenError("You do not have access to one or more branches");
    }
  }

  /** Filter branches by id when access is SELECTED. */
  branchIdScopeFilter(ctx: TenantContext): Prisma.BranchWhereInput {
    if (this.hasAllBranchAccess(ctx)) return {};
    return { id: { in: ctx.branchAccess.branchIds } };
  }

  /** Filter leads/calls by branchId when access is SELECTED (excludes null branchId). */
  branchRelationFilter(ctx: TenantContext): Prisma.LeadWhereInput {
    if (this.hasAllBranchAccess(ctx)) return {};
    return { branchId: { in: ctx.branchAccess.branchIds } };
  }

  callLogBranchFilter(ctx: TenantContext): Prisma.CallLogWhereInput {
    if (this.hasAllBranchAccess(ctx)) return {};
    return { branchId: { in: ctx.branchAccess.branchIds } };
  }

  mergeLeadWhere(
    ctx: TenantContext,
    where: Prisma.LeadWhereInput,
  ): Prisma.LeadWhereInput {
    const branchFilter = this.branchRelationFilter(ctx);
    if (Object.keys(branchFilter).length === 0) return where;
    return { AND: [where, branchFilter] };
  }

  mergeCallLogWhere(
    ctx: TenantContext,
    where: Prisma.CallLogWhereInput,
  ): Prisma.CallLogWhereInput {
    const branchFilter = this.callLogBranchFilter(ctx);
    if (Object.keys(branchFilter).length === 0) return where;
    return { AND: [where, branchFilter] };
  }

  mergeBranchWhere(
    ctx: TenantContext,
    where: Prisma.BranchWhereInput,
  ): Prisma.BranchWhereInput {
    const branchFilter = this.branchIdScopeFilter(ctx);
    if (Object.keys(branchFilter).length === 0) return where;
    return { AND: [where, branchFilter] };
  }

  assertLeadBranchAccess(ctx: TenantContext, branchId: string | null | undefined) {
    if (!branchId) {
      if (!this.hasAllBranchAccess(ctx)) {
        throw new ForbiddenError("You do not have access to this record");
      }
      return;
    }
    this.assertBranchAccess(ctx, branchId);
  }

  assertCallLogBranchAccess(
    ctx: TenantContext,
    branchId: string | null | undefined,
  ) {
    this.assertLeadBranchAccess(ctx, branchId);
  }
}

export const branchAccessService = new BranchAccessService();
