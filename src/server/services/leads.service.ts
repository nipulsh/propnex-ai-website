import { NotFoundError } from "@/server/lib/errors";
import {
  buildConnection,
  encodeIdCursor,
} from "@/server/lib/pagination";
import prisma from "@/server/lib/prisma";
import { LeadsRepository } from "@/server/repositories/leads.repository";
import type { TenantContext } from "@/server/types/context";
import { PERMISSIONS } from "@/server/types/permissions";
import { tenantService } from "@/server/services/tenant.service";

export class LeadsService {
  private readonly repo = new LeadsRepository(prisma);

  async getConnection(
    ctx: TenantContext,
    args: { first?: number; after?: string },
  ) {
    tenantService.requirePermission(ctx, PERMISSIONS.LEADS_READ);

    const limit = Math.min(args.first ?? 20, 100);
    const items = await this.repo.findConnection(
      ctx.companyId,
      limit,
      args.after,
    );

    return buildConnection(items, limit, (item) =>
      encodeIdCursor(item.id, item.createdAt),
    );
  }

  async getById(ctx: TenantContext, id: string) {
    tenantService.requirePermission(ctx, PERMISSIONS.LEADS_READ);

    const lead = await this.repo.findById(ctx.companyId, id);
    if (!lead) {
      throw new NotFoundError("Lead not found");
    }

    return lead;
  }
}

export const leadsService = new LeadsService();
