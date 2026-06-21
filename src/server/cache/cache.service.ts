import { redis } from "@/server/cache/redis.client";
import {
  cacheKeys,
  type PageCacheKey,
} from "@/server/cache/keys";
import { gqlDebug, gqlDebugTimed } from "@/server/graphql/debug";

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    const client = redis;
    try {
      const cached = await gqlDebugTimed(`redis:get:${key}`, () => client.get(key));
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch {
      gqlDebug("redis:get:error", { key });
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!redis) return;
    const client = redis;
    try {
      await gqlDebugTimed(`redis:set:${key}`, () =>
        client.setex(key, ttlSeconds, JSON.stringify(value)),
      );
    } catch {
      gqlDebug("redis:set:error", { key });
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!redis || keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch {
      // ignore
    }
  }

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await gqlDebugTimed(`db:factory:${key}`, factory);
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async invalidateCompanyCredits(companyId: string): Promise<void> {
    await this.del(cacheKeys.companyCredits(companyId));
  }

  async invalidateCompanyCallLogs(companyId: string): Promise<void> {
    await this.del(cacheKeys.companyTopCallLogs(companyId));
  }

  async invalidateCompanyAnalytics(companyId: string): Promise<void> {
    await this.del(cacheKeys.companyAnalytics(companyId));
  }

  async invalidateCompanyAgentStatus(companyId: string): Promise<void> {
    await this.del(cacheKeys.companyAgentStatus(companyId));
  }

  async invalidateUserPermissions(userId: string): Promise<void> {
    await this.del(cacheKeys.userPermissions(userId));
  }

  async invalidateCallRelated(companyId: string): Promise<void> {
    await this.del(
      cacheKeys.companyTopCallLogs(companyId),
      cacheKeys.companyAnalytics(companyId),
      cacheKeys.companyCredits(companyId),
    );
    await this.invalidatePagePrefix(companyId, "home");
    await this.invalidatePagePrefix(companyId, "call-logs");
    await this.invalidatePagePrefix(companyId, "call-detail");
    await this.invalidatePagePrefix(companyId, "phone-detail");
    await this.invalidatePagePrefix(companyId, "agent-detail");
    await this.invalidatePagePrefix(companyId, "lead-reactivation");
  }

  async invalidatePage(companyId: string, pageKey: PageCacheKey): Promise<void> {
    await this.del(cacheKeys.page(companyId, pageKey));
  }

  async invalidatePagePrefix(
    companyId: string,
    pageKey: PageCacheKey,
  ): Promise<void> {
    if (!redis) return;
    const prefix = cacheKeys.pagePrefix(companyId, pageKey);
    try {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          `${prefix}*`,
          "COUNT",
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== "0");
    } catch {
      gqlDebug("redis:invalidate-page-prefix:error", { prefix });
    }
  }

  async invalidateAgentPages(companyId: string): Promise<void> {
    await this.invalidateCompanyAgentStatus(companyId);
    await this.invalidatePage(companyId, "home");
    await this.invalidatePage(companyId, "agents");
    await this.invalidatePagePrefix(companyId, "agent-detail");
    await this.invalidatePage(companyId, "setup");
  }

  async invalidatePhoneNumberPages(companyId: string): Promise<void> {
    await this.invalidatePage(companyId, "setup");
    await this.invalidatePagePrefix(companyId, "phone-detail");
    await this.invalidatePagePrefix(companyId, "agent-detail");
  }

  async invalidateLeadPages(companyId: string): Promise<void> {
    await this.invalidatePage(companyId, "home");
    await this.invalidatePagePrefix(companyId, "lead-reactivation");
    await this.invalidatePagePrefix(companyId, "call-logs");
  }

  async invalidateUploadedContactPages(companyId: string): Promise<void> {
    await this.invalidatePagePrefix(companyId, "phone-contacts");
  }

  async invalidateBillingPages(companyId: string): Promise<void> {
    await this.invalidateCompanyCredits(companyId);
    await this.invalidatePagePrefix(companyId, "billing");
    await this.invalidatePage(companyId, "home");
  }

  async invalidateSettingsPages(companyId: string): Promise<void> {
    await this.invalidatePage(companyId, "settings");
    await this.invalidatePage(companyId, "setup");
  }
}

export const cacheService = new CacheService();
