import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { buildTenantContext } from "@/server/lib/tenant-context-builder";
import { resolveAuthenticatedTenant } from "@/server/services/company-resolution.service";
import type { Permission } from "@/lib/permissions";
import {
  ctxHasAllPermissions,
  ctxHasAnyPermission,
  ctxHasPermission,
  type AccessContext,
} from "@/lib/permissions-policy";
import { ForbiddenError } from "@/server/lib/errors";
import type { TenantContext } from "@/server/types/context";

export async function resolveTenantContext(): Promise<TenantContext | null> {
  const { userId, orgId } = await auth();
  if (!userId) return null;

  const tenant = await resolveAuthenticatedTenant(userId, orgId);
  if (!tenant) return null;

  return buildTenantContext(userId, tenant.company.id, tenant.membership);
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

function tenantToAccess(ctx: TenantContext): AccessContext {
  return {
    membershipId: ctx.membershipId,
    userId: ctx.userId,
    role: ctx.role as AccessContext["role"],
    permissions: ctx.permissions,
    branchAccessType: ctx.branchAccess.type,
    branchIds: ctx.branchAccess.branchIds,
  };
}

export async function requireTenantPermission(permission: Permission) {
  const result = await requireTenantContext();
  if (result.error || !result.ctx) return result;

  if (!ctxHasPermission(tenantToAccess(result.ctx), permission)) {
    return {
      error: NextResponse.json(
        { error: `Missing permission: ${permission}` },
        { status: 403 },
      ),
      ctx: null,
    };
  }

  return result;
}

export async function requireTenantPermissions(
  permissions: Permission[],
  mode: "any" | "all" = "all",
) {
  const result = await requireTenantContext();
  if (result.error || !result.ctx) return result;

  const access = tenantToAccess(result.ctx);
  const allowed =
    mode === "any"
      ? ctxHasAnyPermission(access, permissions)
      : ctxHasAllPermissions(access, permissions);

  if (!allowed) {
    return {
      error: NextResponse.json(
        { error: "Missing required permissions" },
        { status: 403 },
      ),
      ctx: null,
    };
  }

  return result;
}

export function assertTenantPermission(ctx: TenantContext, permission: Permission) {
  if (!ctxHasPermission(tenantToAccess(ctx), permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}
