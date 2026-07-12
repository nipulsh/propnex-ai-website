import { ClientError, GraphQLClient } from "graphql-request";

import {
  AuthRequiredError,
  isUnauthorizedClientError,
  markGraphQLAuthBlocked,
  throwIfAuthBlocked,
} from "@/lib/graphql/auth-error";
import { getClerkClientToken } from "@/lib/clerk-client-token";

const DEFAULT_FETCH_TIMEOUT_MS = 60_000;

function getGraphQLEndpoint() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return `${base.replace(/\/$/, "")}/graphql`;
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
    fetch: createFetchWithTimeout(),
  });
}

export const graphqlClient = createGraphQLClient();

/** Backend auth is Bearer-token only now — resolve the current Clerk token per call. */
async function getAuthToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return getClerkClientToken();
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { getToken } = await auth();
  return getToken();
}

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  throwIfAuthBlocked();

  const token = await getAuthToken();

  try {
    return await graphqlClient.request<T>(
      query,
      variables,
      token ? { Authorization: `Bearer ${token}` } : {},
    );
  } catch (error) {
    if (isUnauthorizedClientError(error)) {
      markGraphQLAuthBlocked();
      const status =
        error instanceof ClientError ? error.response.status : 401;
      const message =
        error instanceof ClientError
          ? (error.response.errors?.[0]?.message ??
            "Organization context required")
          : "Organization context required";
      throw new AuthRequiredError(message, status);
    }
    throw error;
  }
}
