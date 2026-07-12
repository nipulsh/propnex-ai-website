import {
  AuthRequiredError,
  markGraphQLAuthBlocked,
  throwIfAuthBlocked,
} from "@/lib/graphql/auth-error";

export type PageCacheKey =
  | "home"
  | "billing"
  | "call-logs"
  | "call-detail"
  | "agents"
  | "agent-detail"
  | "agent-library"
  | "agent-template"
  | "lead-reactivation"
  | "setup"
  | "settings"
  | "phone-detail"
  | "phone-contacts";

export type PageCacheParams = {
  id?: string;
  slug?: string;
  after?: string;
  filter?: Record<string, unknown>;
};

export interface PageCacheResponse<T> {
  data: T;
  cachedAt: number;
  fromCache: boolean;
}

export async function fetchCachedPage<T>(
  pageKey: PageCacheKey,
  params?: PageCacheParams,
): Promise<T> {
  throwIfAuthBlocked();
  const searchParams = new URLSearchParams();
  if (params?.id) searchParams.set("id", params.id);
  if (params?.slug) searchParams.set("slug", params.slug);
  if (params?.after) searchParams.set("after", params.after);
  if (params?.filter) {
    searchParams.set("filter", JSON.stringify(params.filter));
  }

  const query = searchParams.toString();
  const url = `/api/page-cache/${pageKey}${query ? `?${query}` : ""}`;

  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    if (response.status === 401 || response.status === 403) {
      markGraphQLAuthBlocked();
      throw new AuthRequiredError(
        body.error ?? "Organization context required",
        response.status,
      );
    }
    throw new Error(body.error ?? `Failed to load ${pageKey}`);
  }

  const payload = (await response.json()) as PageCacheResponse<T>;
  return payload.data;
}
