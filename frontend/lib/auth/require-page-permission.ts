import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import type { Permission } from "@/lib/permissions";
import { getRequiredPermissionForPath } from "@/lib/route-permissions";
import { fetchViewerRole } from "@/lib/graphql/api";
import { isAuthRequiredError } from "@/lib/graphql/auth-error";
import {
  ctxHasPermission,
  type AccessContext,
} from "@/lib/permissions-policy";

async function resolveViewerContext(): Promise<AccessContext | null> {
  try {
    const { viewer } = await fetchViewerRole();
    return {
      membershipId: viewer.membershipId,
      userId: viewer.id,
      role: viewer.role as AccessContext["role"],
      permissions: viewer.permissions,
      branchAccessType: viewer.branchAccessType,
      branchIds: viewer.branchIds,
    };
  } catch (error) {
    if (isAuthRequiredError(error)) return null;
    throw error;
  }
}

export async function requirePagePermission(permission: Permission) {
  const ctx = await resolveViewerContext();
  if (!ctx) {
    redirect("/sign-in");
  }

  if (!ctxHasPermission(ctx, permission)) {
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
    return resolveViewerContext();
  }

  // For gated routes, require a valid tenant context (linked contract ID).
  const ctx = await resolveViewerContext();
  if (!ctx) {
    redirect("/sign-in");
  }

  if (ctx.role === "ADMIN" && ctx.branchAccessType === "SELECTED") {
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
    !ctxHasPermission(ctx, required)
  ) {
    redirect("/unauthorized");
  }

  return ctx;
}
