import { GraphQLClient } from "graphql-request";

const DEFAULT_FETCH_TIMEOUT_MS = 60_000;

function getGraphQLEndpoint() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/graphql`;
  }
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  const origin = base.startsWith("http") ? base : `https://${base}`;
  return `${origin}/api/graphql`;
}

function createFetchWithTimeout(timeoutMs = DEFAULT_FETCH_TIMEOUT_MS) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

export function createGraphQLClient() {
  return new GraphQLClient(getGraphQLEndpoint(), {
    credentials: "include",
    fetch: createFetchWithTimeout(),
  });
}

export const graphqlClient = createGraphQLClient();

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return graphqlClient.request<T>(query, variables);
}
