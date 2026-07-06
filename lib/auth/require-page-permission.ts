import { redirect } from "next/navigation";

import type { Permission } from "@/lib/permissions";
import { getRequiredPermissionForPath } from "@/lib/route-permissions";
import { resolveTenantContext } from "@/lib/api/tenant-context";
import {
  ctxHasPermission,
  type AccessContext,
} from "@/lib/permissions-policy";

function tenantToAccess(
  ctx: NonNullable<Awaited<ReturnType<typeof resolveTenantContext>>>,
): AccessContext {
  return {
    membershipId: ctx.membershipId,
    userId: ctx.userId,
    role: ctx.role as AccessContext["role"],
    permissions: ctx.permissions,
    branchAccessType: ctx.branchAccess.type,
    branchIds: ctx.branchAccess.branchIds,
  };
}

export async function requirePagePermission(permission: Permission) {
  const ctx = await resolveTenantContext();
  if (!ctx) {
    redirect("/sign-in");
  }

  if (!ctxHasPermission(tenantToAccess(ctx), permission)) {
    redirect("/unauthorized");
  }

  return ctx;
}

export async function requirePageAccess(pathname: string) {
  const required = getRequiredPermissionForPath(pathname);
  const ctx = await resolveTenantContext();
  if (!ctx) {
    redirect("/sign-in");
  }

  if (required === null) {
    return ctx;
  }

  if (required && !ctxHasPermission(tenantToAccess(ctx), required)) {
    redirect("/unauthorized");
  }

  return ctx;
}
