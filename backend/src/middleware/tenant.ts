import type { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";

import { createDataLoaders } from "@/server/graphql/dataloaders";
import { buildTenantContext } from "@/server/lib/tenant-context-builder";
import { extractBearerToken, verifyClerkToken } from "@/server/lib/verify-request";
import { resolveAuthenticatedTenant } from "@/server/services/company-resolution.service";
import type { TenantContext } from "@/server/types/context";
import type { Permission } from "@/lib/permissions";
import {
  ctxHasAllPermissions,
  ctxHasAnyPermission,
  ctxHasPermission,
  type AccessContext,
} from "@/lib/permissions-policy";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenant?: TenantContext;
      clerkUserId?: string;
      serviceCompanyId?: string;
    }
  }
}

function bearerFrom(req: Request): string | null {
  return extractBearerToken(req.headers.authorization ?? null);
}

export async function resolveTenantContext(req: Request): Promise<TenantContext | null> {
  const { userId, orgId } = await verifyClerkToken(bearerFrom(req));
  if (!userId) return null;

  const tenant = await resolveAuthenticatedTenant(userId, orgId);
  if (!tenant) return null;

  return buildTenantContext(userId, tenant.company.id, tenant.membership);
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

/** Requires a signed-in user with a resolved tenant (company + membership). Attaches req.tenant. */
export function requireTenant() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = await resolveTenantContext(req);
    if (!ctx) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.tenant = ctx;
    next();
  };
}

/** Requires a tenant with a specific permission. */
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = await resolveTenantContext(req);
    if (!ctx) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!ctxHasPermission(tenantToAccess(ctx), permission)) {
      res.status(403).json({ error: `Missing permission: ${permission}` });
      return;
    }
    req.tenant = ctx;
    next();
  };
}

/** Requires a tenant with any/all of a set of permissions. */
export function requirePermissions(permissions: Permission[], mode: "any" | "all" = "all") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = await resolveTenantContext(req);
    if (!ctx) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const access = tenantToAccess(ctx);
    const allowed =
      mode === "any" ? ctxHasAnyPermission(access, permissions) : ctxHasAllPermissions(access, permissions);
    if (!allowed) {
      res.status(403).json({ error: "Missing required permissions" });
      return;
    }
    req.tenant = ctx;
    next();
  };
}

/** Requires only a signed-in Clerk user — no company/tenant resolution. */
export function requireAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = await verifyClerkToken(bearerFrom(req));
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.clerkUserId = userId;
    next();
  };
}

const SERVICE_USER_ID = "agent-server";

/** Builds a synthetic full-access tenant context for trusted service-to-service calls. */
export function createServiceTenantContext(companyId: string): TenantContext {
  return {
    userId: SERVICE_USER_ID,
    clerkUserId: SERVICE_USER_ID,
    companyId,
    membershipId: "service",
    role: UserRole.OWNER,
    permissions: [],
    branchAccess: { type: "ALL", branchIds: [] },
    loaders: createDataLoaders(companyId),
  };
}

/** Validates the shared-secret header used by the internal dialer/agent server. */
export function requireAgentServerKey() {
  return (req: Request, res: Response, next: NextFunction) => {
    const expectedKey = process.env.AGENT_SERVER_API_KEY;
    if (!expectedKey) {
      res.status(503).json({ error: "Agent server API key is not configured" });
      return;
    }

    const providedKey = req.headers["x-agent-server-key"];
    if (!providedKey || providedKey !== expectedKey) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const companyId = (req.headers["x-company-id"] as string | undefined)?.trim();
    if (!companyId) {
      res.status(400).json({ error: "X-Company-Id header is required" });
      return;
    }

    req.serviceCompanyId = companyId;
    next();
  };
}
