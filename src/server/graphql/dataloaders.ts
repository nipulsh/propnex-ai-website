import DataLoader from "dataloader";

import prisma from "@/server/lib/prisma";
import { AgentsRepository } from "@/server/repositories/agents.repository";
import { CallLogsRepository } from "@/server/repositories/call-logs.repository";
import { TenantRepository } from "@/server/repositories/tenant.repository";

export function createDataLoaders(companyId: string) {
  const leadsRepo = new CallLogsRepository(prisma);
  const agentsRepo = new AgentsRepository(prisma);
  const tenantRepo = new TenantRepository(prisma);

  return {
    lead: new DataLoader(async (ids: readonly string[]) => {
      const leads = await leadsRepo.findLeadsByIds(companyId, [...ids]);
      const map = new Map(leads.map((l) => [l.id, l]));
      return ids.map((id) => map.get(id) ?? null);
    }),
    aiAgent: new DataLoader(async (ids: readonly string[]) => {
      const agents = await agentsRepo.findByIds(companyId, [...ids]);
      const map = new Map(agents.map((a) => [a.id, a]));
      return ids.map((id) => map.get(id) ?? null);
    }),
    user: new DataLoader(async (ids: readonly string[]) => {
      const users = await tenantRepo.findUsersByIds(companyId, [...ids]);
      const map = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? null);
    }),
  };
}
