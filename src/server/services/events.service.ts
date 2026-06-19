import prisma from "@/server/lib/prisma";
import { EventsRepository } from "@/server/repositories/events.repository";
import type { TenantContext } from "@/server/types/context";
import { PERMISSIONS } from "@/server/types/permissions";
import { tenantService } from "@/server/services/tenant.service";
import type { Prisma, SystemEventType } from "@prisma/client";

export class EventsService {
  private readonly repo = new EventsRepository(prisma);

  async listRecent(ctx: TenantContext, limit = 20) {
    tenantService.requirePermission(ctx, PERMISSIONS.EVENTS_READ);
    return this.repo.listRecent(ctx.companyId, Math.min(limit, 50));
  }

  async emit(
    ctx: Pick<TenantContext, "companyId" | "userId">,
    data: {
      type: SystemEventType;
      entityType?: string;
      entityId?: string;
      title: string;
      payload?: Prisma.InputJsonValue;
    },
  ) {
    return this.repo.create(ctx.companyId, {
      ...data,
      actorId: ctx.userId,
    });
  }
}

export const eventsService = new EventsService();
