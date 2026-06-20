import { createYoga } from "graphql-yoga";

import { createGraphQLContext } from "@/server/graphql/context";
import { gqlDebug } from "@/server/graphql/debug";
import { maskGraphQLError } from "@/server/graphql/map-error";
import { schema } from "@/server/graphql/server";

const isDev = process.env.NODE_ENV !== "production";

function useGraphQLDebugPlugin() {
  return {
    onRequest({ request }: { request: Request }) {
      gqlDebug("request:start", { method: request.method });
    },
    onResponse({
      response,
    }: {
      response: Response;
    }) {
      gqlDebug("request:end", { status: response.status });
    },
  };
}

export const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  landingPage: isDev,
  context: createGraphQLContext,
  plugins: [useGraphQLDebugPlugin()],
  maskedErrors: {
    maskError(error, message, dev) {
      return maskGraphQLError(error, message, dev ?? false);
    },
  },
});
