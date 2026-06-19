import type { UserRole } from "@prisma/client";
import type DataLoader from "dataloader";

import type { createDataLoaders } from "@/server/graphql/dataloaders";

export type TenantContext = {
  userId: string;
  clerkUserId: string;
  companyId: string;
  role: UserRole;
  permissions: string[];
  loaders: ReturnType<typeof createDataLoaders>;
};

export type GraphQLContext = TenantContext & {
  isAuthenticated: boolean;
};
