import type { AnalyticsGranularity } from "@prisma/client";

import { cacheService } from "@/server/cache/cache.service";
import { CACHE_TTL, cacheKeys } from "@/server/cache/keys";
import prisma from "@/server/lib/prisma";
import { AnalyticsRepository } from "@/server/repositories/billing.repository";
import type { TenantContext } from "@/server/types/context";
import { PERMISSIONS } from "@/server/types/permissions";
import { tenantService } from "@/server/services/tenant.service";

type MetricsJson = Record<string, number>;

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export class AnalyticsService {
  private readonly repo = new AnalyticsRepository(prisma);

  async getSummary(
    ctx: TenantContext,
    granularity: AnalyticsGranularity = "DAILY",
  ) {
    tenantService.requirePermission(ctx, PERMISSIONS.ANALYTICS_READ);

    const cacheKey = `${cacheKeys.companyAnalytics(ctx.companyId)}:${granularity}`;

    return cacheService.getOrSet(cacheKey, CACHE_TTL.ANALYTICS, async () => {
      const snapshot = await this.repo.getLatestSnapshot(
        ctx.companyId,
        granularity,
      );

      const metrics = (snapshot?.metrics as MetricsJson) ?? {};

      const totalCalls = metrics.totalCalls ?? 0;
      const connectedCalls = metrics.connectedCalls ?? 0;
      const conversionRate =
        totalCalls > 0
          ? Math.round((connectedCalls / totalCalls) * 1000) / 10
          : 0;

      return {
        totalCalls,
        connectedCalls,
        conversionRate,
        generatedLeads: metrics.generatedLeads ?? 0,
        periodStart: snapshot?.periodStart?.toISOString() ?? null,
        periodEnd: snapshot?.periodEnd?.toISOString() ?? null,
      };
    });
  }

  async incrementDailyMetrics(
    companyId: string,
    delta: MetricsJson,
  ) {
    const periodStart = startOfDay();
    const periodEnd = endOfDay();

    await this.repo.upsertDailySnapshot(
      companyId,
      periodStart,
      periodEnd,
      delta,
    );

    await cacheService.invalidateCompanyAnalytics(companyId);
  }
}

export const analyticsService = new AnalyticsService();
