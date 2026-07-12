import { Router } from "express";

import { cacheKeys } from "@/server/cache/keys";
import { pageCacheService } from "@/server/cache/page-cache.service";
import { isAppError } from "@/server/lib/errors";
import { parsePageCacheParams } from "@/server/page-cache/parse-params";
import { getPageLoader, isValidPageCacheKey } from "@/server/page-cache/registry";
import { requireTenant } from "@/middleware/tenant";

export const pageCacheRouter = Router();

pageCacheRouter.get("/:pageKey", requireTenant(), async (req, res) => {
  const pageKey = req.params.pageKey as string;

  if (!isValidPageCacheKey(pageKey)) {
    res.status(404).json({ error: "Unknown page key" });
    return;
  }

  try {
    const loader = getPageLoader(pageKey);
    if (!loader) {
      res.status(404).json({ error: "Page loader not found" });
      return;
    }

    const searchParams = new URLSearchParams(req.query as Record<string, string>);
    const params = parsePageCacheParams(searchParams);
    const cacheKey = cacheKeys.page(req.tenant!.companyId, pageKey, params);

    const forwardedRequest = new Request("http://backend.local/page-cache", {
      headers: req.headers.authorization ? { authorization: req.headers.authorization } : {},
    });

    const result = await pageCacheService.getPageData(cacheKey, () => loader(forwardedRequest, params));

    res.json(result);
  } catch (error) {
    if (isAppError(error)) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : "Failed to load page cache";
    res.status(500).json({ error: message });
  }
});
