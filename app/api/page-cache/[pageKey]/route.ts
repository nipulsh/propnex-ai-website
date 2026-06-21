import { createGraphQLContext } from "@/server/graphql/context";
import { isAppError } from "@/server/lib/errors";
import { cacheKeys } from "@/server/cache/keys";
import { pageCacheService } from "@/server/cache/page-cache.service";
import { parsePageCacheParams } from "@/server/page-cache/parse-params";
import {
  getPageLoader,
  isValidPageCacheKey,
} from "@/server/page-cache/registry";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ pageKey: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { pageKey } = await context.params;

  if (!isValidPageCacheKey(pageKey)) {
    return Response.json({ error: "Unknown page key" }, { status: 404 });
  }

  try {
    const gqlContext = await createGraphQLContext();
    const loader = getPageLoader(pageKey);
    if (!loader) {
      return Response.json({ error: "Page loader not found" }, { status: 404 });
    }

    const searchParams = new URL(request.url).searchParams;
    const params = parsePageCacheParams(searchParams);
    const cacheKey = cacheKeys.page(gqlContext.companyId, pageKey, params);

    const result = await pageCacheService.getPageData(cacheKey, () =>
      loader(request, params),
    );

    return Response.json(result);
  } catch (error) {
    if (isAppError(error)) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    const message =
      error instanceof Error ? error.message : "Failed to load page cache";
    return Response.json({ error: message }, { status: 500 });
  }
}
