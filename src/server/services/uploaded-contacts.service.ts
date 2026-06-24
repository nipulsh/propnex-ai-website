import { AppError, NotFoundError } from "@/server/lib/errors";
import { cacheService } from "@/server/cache/cache.service";
import prisma from "@/server/lib/prisma";
import { UploadedContactsRepository } from "@/server/repositories/uploaded-contacts.repository";
import type { TenantContext } from "@/server/types/context";
import { PERMISSIONS } from "@/server/types/permissions";
import { tenantService } from "@/server/services/tenant.service";
import { normalizeContactPhone } from "@/lib/contact-phone-validation";
const MAX_IMPORT_ROWS = 5000;

function mapUploadedContact(row: {
  id: string;
  phone: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
  };
}

export class UploadedContactsService {
  private readonly repo = new UploadedContactsRepository(prisma);

  async list(ctx: TenantContext) {
    tenantService.requirePermission(ctx, PERMISSIONS.LEADS_READ);
    const rows = await this.repo.findMany(ctx.companyId);
    return rows.map(mapUploadedContact);
  }

  async create(ctx: TenantContext, phone: string) {
    tenantService.requirePermission(ctx, PERMISSIONS.LEADS_WRITE);

    const normalized = normalizeContactPhone(phone);
    if (!normalized) {
      throw new AppError(
        "Phone number must be exactly 10 digits.",
        "INVALID_PHONE",
      );
    }

    const existing = await this.repo.findByPhones(ctx.companyId, [normalized]);
    if (existing.length > 0) {
      throw new AppError("This phone number already exists.", "DUPLICATE_PHONE");
    }

    const row = await this.repo.create(ctx.companyId, normalized);
    await cacheService.invalidateUploadedContactPages(ctx.companyId);
    return mapUploadedContact(row);
  }

  async importPhones(ctx: TenantContext, phones: string[]) {
    tenantService.requirePermission(ctx, PERMISSIONS.LEADS_WRITE);

    const validPhones: string[] = [];
    let invalid = 0;
    const seen = new Set<string>();

    for (const raw of phones.slice(0, MAX_IMPORT_ROWS)) {
      const normalized = normalizeContactPhone(raw);
      if (!normalized) {
        invalid++;
        continue;
      }
      if (seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      validPhones.push(normalized);
    }

    const { created, skipped } = await this.repo.createMany(
      ctx.companyId,
      validPhones,
    );

    if (created > 0) {
      await cacheService.invalidateUploadedContactPages(ctx.companyId);
    }

    return { created, skipped, invalid };
  }

  async delete(ctx: TenantContext, id: string) {
    tenantService.requirePermission(ctx, PERMISSIONS.LEADS_WRITE);

    const deleted = await this.repo.delete(ctx.companyId, id);
    if (!deleted) {
      throw new NotFoundError("Contact not found");
    }

    await cacheService.invalidateUploadedContactPages(ctx.companyId);
    return true;
  }

  async bulkDelete(ctx: TenantContext, ids: string[]) {
    tenantService.requirePermission(ctx, PERMISSIONS.LEADS_WRITE);

    const count = await this.repo.bulkDelete(ctx.companyId, ids);
    if (count > 0) {
      await cacheService.invalidateUploadedContactPages(ctx.companyId);
    }
    return count;
  }
}

export const uploadedContactsService = new UploadedContactsService();
