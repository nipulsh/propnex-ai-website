import { GraphQLClient } from "graphql-request";

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

export function createGraphQLClient() {
  return new GraphQLClient(getGraphQLEndpoint(), {
    credentials: "include",
  });
}

export const graphqlClient = createGraphQLClient();

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return graphqlClient.request<T>(query, variables);
}
