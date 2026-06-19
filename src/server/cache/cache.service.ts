import { redis } from "@/server/cache/redis.client";
import { cacheKeys } from "@/server/cache/keys";

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!redis) return;
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // cache write failures should not break requests
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

    const value = await factory();
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
  }
}

export const cacheService = new CacheService();
