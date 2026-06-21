import { BaseRepository } from "@/server/repositories/base.repository";

export class UploadedContactsRepository extends BaseRepository {
  findMany(companyId: string) {
    return this.prisma.uploadedContact.findMany({
      where: this.scope(companyId),
      orderBy: { createdAt: "desc" },
    });
  }

  findById(companyId: string, id: string) {
    return this.prisma.uploadedContact.findFirst({
      where: { id, companyId },
    });
  }

  findByPhones(companyId: string, phones: string[]) {
    if (phones.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.uploadedContact.findMany({
      where: { companyId, phone: { in: phones } },
      select: { phone: true },
    });
  }

  create(companyId: string, phone: string) {
    return this.prisma.uploadedContact.create({
      data: {
        phone,
        company: { connect: { id: companyId } },
      },
    });
  }

  async createMany(
    companyId: string,
    phones: string[],
  ): Promise<{ created: number; skipped: number }> {
    const seen = new Set<string>();
    const uniquePhones: string[] = [];

    for (const phone of phones) {
      if (seen.has(phone)) {
        continue;
      }
      seen.add(phone);
      uniquePhones.push(phone);
    }

    if (uniquePhones.length === 0) {
      return { created: 0, skipped: 0 };
    }

    const existing = await this.findByPhones(companyId, uniquePhones);
    const existingSet = new Set(existing.map((row) => row.phone));
    const toCreate = uniquePhones.filter((phone) => !existingSet.has(phone));
    const skipped = uniquePhones.length - toCreate.length;

    if (toCreate.length > 0) {
      await this.prisma.uploadedContact.createMany({
        data: toCreate.map((phone) => ({ companyId, phone })),
      });
    }

    return { created: toCreate.length, skipped };
  }

  async delete(companyId: string, id: string): Promise<boolean> {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      return false;
    }
    await this.prisma.uploadedContact.delete({ where: { id } });
    return true;
  }

  async bulkDelete(companyId: string, ids: string[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }
    const result = await this.prisma.uploadedContact.deleteMany({
      where: { companyId, id: { in: ids } },
    });
    return result.count;
  }
}
