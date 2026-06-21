import { createYoga } from "graphql-yoga";

import { createGraphQLContext } from "@/server/graphql/context";
import { gqlDebug, gqlLog } from "@/server/graphql/debug";
import { maskGraphQLError } from "@/server/graphql/map-error";
import { schema } from "@/server/graphql/server";

const isDev = process.env.NODE_ENV !== "production";

function useGraphQLDebugPlugin() {
  return {
    onRequest({ request }: { request: Request }) {
      gqlLog("yoga:request", { method: request.method });
      gqlDebug("request:start", { method: request.method });
    },
    onResponse({ response }: { response: Response }) {
      gqlLog("yoga:response", { status: response.status });
      gqlDebug("request:end", { status: response.status });
    },
  };
}

async function buildContext(): ReturnType<typeof createGraphQLContext> {
  gqlLog("yoga:context:start");
  try {
    const ctx = await createGraphQLContext();
    gqlLog("yoga:context:done", {
      companyId: ctx.companyId,
      userId: ctx.userId,
      role: ctx.role,
    });
    return ctx;
  } catch (error) {
    gqlLog("yoga:context:failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  landingPage: isDev,
  context: buildContext,
  plugins: [useGraphQLDebugPlugin()],
  maskedErrors: {
    maskError(error, message, dev) {
      gqlLog("yoga:maskError", {
        message,
        dev: dev ?? false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return maskGraphQLError(error, message, dev ?? false);
    },
  },
});
