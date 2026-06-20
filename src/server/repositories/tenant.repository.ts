import type {
  CallVolumeRange,
  MemberStatus,
  PrimaryUseCase,
  UserRole,
} from "@prisma/client";

import { BaseRepository } from "@/server/repositories/base.repository";

export class TenantRepository extends BaseRepository {
  findCompanyByClerkOrgId(clerkOrganizationId: string) {
    return this.prisma.company.findUnique({
      where: { clerkOrganizationId },
    });
  }

  findCompanyById(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
    });
  }

  findUserByClerkId(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
    });
  }

  findMembership(companyId: string, userId: string) {
    return this.prisma.companyMember.findUnique({
      where: {
        companyId_userId: { companyId, userId },
      },
      include: {
        customRole: true,
        user: true,
        company: true,
      },
    });
  }

  upsertUser(data: {
    clerkUserId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    phone?: string | null;
  }) {
    return this.prisma.user.upsert({
      where: { clerkUserId: data.clerkUserId },
      create: {
        clerkUserId: data.clerkUserId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
        phone: data.phone,
      },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
        phone: data.phone,
      },
    });
  }

  upsertCompany(data: {
    clerkOrganizationId: string;
    name: string;
    slug: string;
    primaryUseCase?: PrimaryUseCase | null;
    callVolume?: CallVolumeRange | null;
  }) {
    return this.prisma.company.upsert({
      where: { clerkOrganizationId: data.clerkOrganizationId },
      create: {
        clerkOrganizationId: data.clerkOrganizationId,
        name: data.name,
        slug: data.slug,
        primaryUseCase: data.primaryUseCase ?? undefined,
        callVolume: data.callVolume ?? undefined,
      },
      update: {
        name: data.name,
        slug: data.slug,
      },
    });
  }

  upsertMembership(data: {
    companyId: string;
    userId: string;
    role: UserRole;
    status?: MemberStatus;
  }) {
    return this.prisma.companyMember.upsert({
      where: {
        companyId_userId: {
          companyId: data.companyId,
          userId: data.userId,
        },
      },
      create: {
        companyId: data.companyId,
        userId: data.userId,
        role: data.role,
        status: data.status ?? "ACTIVE",
        joinedAt: new Date(),
      },
      update: {
        role: data.role,
        status: data.status ?? "ACTIVE",
      },
    });
  }

  findUsersByIds(companyId: string, ids: string[]) {
    return this.prisma.user.findMany({
      where: {
        id: { in: ids },
        memberships: { some: { companyId, status: "ACTIVE" } },
      },
    });
  }
}
