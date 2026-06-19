import { BaseRepository } from "@/server/repositories/base.repository";

export class AgentsRepository extends BaseRepository {
  findStatusSummary(companyId: string) {
    return this.prisma.aiAgent.groupBy({
      by: ["status"],
      where: this.scope(companyId),
      _count: { id: true },
    });
  }

  findById(companyId: string, id: string) {
    return this.prisma.aiAgent.findFirst({
      where: { id, companyId },
    });
  }

  findMany(companyId: string) {
    return this.prisma.aiAgent.findMany({
      where: this.scope(companyId),
      orderBy: { createdAt: "desc" },
    });
  }

  findByIds(companyId: string, ids: string[]) {
    return this.prisma.aiAgent.findMany({
      where: { companyId, id: { in: ids } },
    });
  }
}
