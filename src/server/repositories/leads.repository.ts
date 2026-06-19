import type { Prisma } from "@prisma/client";

import { BaseRepository } from "@/server/repositories/base.repository";
import { decodeIdCursor } from "@/server/lib/pagination";

export class LeadsRepository extends BaseRepository {
  findById(companyId: string, id: string) {
    return this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        stage: true,
        source: true,
        assignedUser: true,
      },
    });
  }

  findConnection(companyId: string, limit: number, after?: string) {
    const cursor = after ? decodeIdCursor(after) : undefined;

    return this.prisma.lead.findMany({
      where: this.scope(companyId),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor.id },
            skip: 1,
          }
        : {}),
    });
  }

  create(companyId: string, data: Prisma.LeadCreateWithoutCompanyInput) {
    return this.prisma.lead.create({
      data: {
        ...data,
        company: { connect: { id: companyId } },
      },
    });
  }
}
