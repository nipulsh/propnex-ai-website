import { createYoga } from "graphql-yoga";

import { createGraphQLContext } from "@/server/graphql/context";
import { schema } from "@/server/graphql/server";
import { isAppError } from "@/server/lib/errors";

export const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  landingPage: process.env.NODE_ENV !== "production",
  context: createGraphQLContext,
  maskedErrors: {
    maskError(error, message, isDev) {
      const original = error as { originalError?: unknown };
      if (isAppError(original.originalError)) {
        return error as Error;
      }
      if (!isDev) {
        return new Error("Internal server error");
      }
      return error as Error;
    },
  },
});
