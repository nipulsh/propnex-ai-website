import path from "node:path";

import { loadFilesSync } from "@graphql-tools/load-files";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { resolvers } from "@/server/resolvers";

const typeDefs = loadFilesSync(
  path.join(process.cwd(), "src/server/graphql/schema/**/*.graphql"),
);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
