import type { NextRequest } from "next/server";

import type { Permission } from "@/lib/permissions";
import {
  requireTenantContext,
  requireTenantPermission,
  requireTenantPermissions,
} from "@/lib/api/tenant-context";
import type { TenantContext } from "@/server/types/context";

type RouteContext = { params: Promise<Record<string, string>> };

type TenantHandler = (
  request: NextRequest,
  ctx: TenantContext,
  routeCtx: RouteContext,
) => Promise<Response>;

export function withTenant(handler: TenantHandler) {
  return async (request: NextRequest, routeCtx: RouteContext) => {
    const { error, ctx } = await requireTenantContext();
    if (error || !ctx) return error!;
    return handler(request, ctx, routeCtx);
  };
}

export function withTenantPermission(
  permission: Permission,
  handler: TenantHandler,
) {
  return async (request: NextRequest, routeCtx: RouteContext) => {
    const { error, ctx } = await requireTenantPermission(permission);
    if (error || !ctx) return error!;
    return handler(request, ctx, routeCtx);
  };
}

export function withTenantPermissions(
  permissions: Permission[],
  mode: "any" | "all",
  handler: TenantHandler,
) {
  return async (request: NextRequest, routeCtx: RouteContext) => {
    const { error, ctx } = await requireTenantPermissions(permissions, mode);
    if (error || !ctx) return error!;
    return handler(request, ctx, routeCtx);
  };
}
