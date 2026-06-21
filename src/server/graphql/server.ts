import { makeExecutableSchema } from "@graphql-tools/schema";

import { resolvers } from "@/server/resolvers";
import { typeDefs } from "@/server/graphql/type-defs.generated";

export const schema = makeExecutableSchema({
  typeDefs: [...typeDefs],
  resolvers,
});
