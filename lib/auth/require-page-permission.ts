import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

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

  // For ungated routes (permission = null), only require Clerk sign-in,
  // not a full tenant context. This lets authenticated users who haven't
  // yet linked a Contract ID reach pages like /settings.
  if (required === null) {
    const { userId } = await auth();
    if (!userId) {
      redirect("/sign-in");
    }
    // Still try to resolve tenant context if available, but don't block if missing
    const ctx = await resolveTenantContext();
    return ctx;
  }

  // For gated routes, require a valid tenant context (linked contract ID).
  const ctx = await resolveTenantContext();
  if (!ctx) {
    redirect("/sign-in");
  }

  if (ctx.role === "ADMIN" && ctx.branchAccess.type === "SELECTED") {
    const allowedPatterns = [
      /^\/dashboard\/?$/,
      /^\/call-logs(\/|$)/,
      /^\/contact\/?$/,
      /^\/unauthorized\/?$/,
    ];
    const isAllowed = allowedPatterns.some((pattern) => pattern.test(pathname));
    if (!isAllowed) {
      redirect("/unauthorized");
    }
  }

  if (
    required !== undefined &&
    !/^\/contact\/?$/.test(pathname) &&
    !ctxHasPermission(tenantToAccess(ctx), required)
  ) {
    redirect("/unauthorized");
  }

  return ctx;
}
