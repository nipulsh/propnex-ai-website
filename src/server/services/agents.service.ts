import { cacheService } from "@/server/cache/cache.service";
import { CACHE_TTL, cacheKeys } from "@/server/cache/keys";
import { NotFoundError } from "@/server/lib/errors";
import prisma from "@/server/lib/prisma";
import { AgentsRepository } from "@/server/repositories/agents.repository";
import type { TenantContext } from "@/server/types/context";
import { PERMISSIONS } from "@/server/types/permissions";
import { tenantService } from "@/server/services/tenant.service";

export class AgentsService {
  private readonly repo = new AgentsRepository(prisma);

  async getStatusSummary(ctx: TenantContext) {
    tenantService.requirePermission(ctx, PERMISSIONS.AGENTS_READ);

    return cacheService.getOrSet(
      cacheKeys.companyAgentStatus(ctx.companyId),
      CACHE_TTL.AGENT_STATUS,
      async () => {
        const groups = await this.repo.findStatusSummary(ctx.companyId);
        const summary = {
          active: 0,
          inactive: 0,
          total: 0,
        };

        for (const group of groups) {
          const count = group._count.id;
          summary.total += count;
          if (group.status === "ACTIVE") summary.active = count;
          if (group.status === "INACTIVE") summary.inactive = count;
        }

        return summary;
      },
    );
  }

  async list(ctx: TenantContext) {
    tenantService.requirePermission(ctx, PERMISSIONS.AGENTS_READ);
    return this.repo.findMany(ctx.companyId);
  }

  async getById(ctx: TenantContext, id: string) {
    tenantService.requirePermission(ctx, PERMISSIONS.AGENTS_READ);

    const agent = await this.repo.findById(ctx.companyId, id);
    if (!agent) {
      throw new NotFoundError("Agent not found");
    }

    return agent;
  }
}

export const agentsService = new AgentsService();
