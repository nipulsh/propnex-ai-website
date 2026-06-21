import { makeExecutableSchema } from "@graphql-tools/schema";

import { gqlLog } from "@/server/graphql/debug";
import { resolvers } from "@/server/resolvers";
import { typeDefs } from "@/server/graphql/type-defs.generated";

gqlLog("schema:init", {
  typeDefCount: typeDefs.length,
  hasQueryType: typeDefs.some((doc) => doc.includes("type Query")),
  hasMutationType: typeDefs.some((doc) => doc.includes("type Mutation")),
  env: {
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasClerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
  },
});

export const schema = makeExecutableSchema({
  typeDefs: [...typeDefs],
  resolvers,
});

gqlLog("schema:ready");
