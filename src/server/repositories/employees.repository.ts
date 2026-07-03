import type {
  BranchAccessType,
  MemberStatus,
  Prisma,
  UserRole,
} from "@prisma/client";

import { BaseRepository } from "@/server/repositories/base.repository";
import { decodeIdCursor } from "@/server/lib/pagination";

export type EmployeeFilter = {
  search?: string;
  role?: UserRole;
  status?: MemberStatus;
  branchId?: string;
};

const memberInclude = {
  user: true,
  customRole: true,
  branchAccess: {
    include: { branch: true },
  },
} satisfies Prisma.CompanyMemberInclude;

export type EmployeeRow = Prisma.CompanyMemberGetPayload<{
  include: typeof memberInclude;
}>;

export class EmployeesRepository extends BaseRepository {
  private buildWhere(
    companyId: string,
    filter?: EmployeeFilter,
  ): Prisma.CompanyMemberWhereInput {
    const where: Prisma.CompanyMemberWhereInput = {
      companyId,
      status: { not: "REMOVED" },
    };

    if (filter?.role) {
      where.role = filter.role;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.branchId) {
      where.OR = [
        { branchAccessType: "ALL" },
        {
          branchAccess: {
            some: { branchId: filter.branchId },
          },
        },
      ];
    }

    const search = filter?.search?.trim();
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    return where;
  }

  findConnection(
    companyId: string,
    limit: number,
    after?: string,
    filter?: EmployeeFilter,
  ) {
    const cursor = after ? decodeIdCursor(after) : undefined;

    return this.prisma.companyMember.findMany({
      where: this.buildWhere(companyId, filter),
      include: memberInclude,
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

  count(companyId: string, filter?: EmployeeFilter) {
    return this.prisma.companyMember.count({
      where: this.buildWhere(companyId, filter),
    });
  }

  findById(companyId: string, memberId: string) {
    return this.prisma.companyMember.findFirst({
      where: { id: memberId, companyId, status: { not: "REMOVED" } },
      include: memberInclude,
    });
  }

  findByEmail(companyId: string, email: string) {
    return this.prisma.companyMember.findFirst({
      where: {
        companyId,
        status: { not: "REMOVED" },
        user: { email: { equals: email, mode: "insensitive" } },
      },
      include: memberInclude,
    });
  }

  countActiveOwners(companyId: string, excludeMemberId?: string) {
    return this.prisma.companyMember.count({
      where: {
        companyId,
        role: "OWNER",
        status: "ACTIVE",
        ...(excludeMemberId ? { id: { not: excludeMemberId } } : {}),
      },
    });
  }

  async setBranchAccess(memberId: string, branchIds: string[]) {
    await this.prisma.memberBranchAccess.deleteMany({
      where: { memberId },
    });

    if (branchIds.length === 0) return;

    await this.prisma.memberBranchAccess.createMany({
      data: branchIds.map((branchId) => ({ memberId, branchId })),
    });
  }

  async updateMember(
    companyId: string,
    memberId: string,
    data: Prisma.CompanyMemberUpdateInput,
  ) {
    const existing = await this.prisma.companyMember.findFirst({
      where: { id: memberId, companyId },
    });
    if (!existing) {
      throw new Error("Employee not found");
    }

    return this.prisma.companyMember.update({
      where: { id: memberId },
      data,
      include: memberInclude,
    });
  }

  createInvitation(data: {
    companyId: string;
    email: string;
    role: UserRole;
    roleId?: string | null;
    jobTitle?: string | null;
    branchAccessType: BranchAccessType;
    branchIds: string[];
    token: string;
    expiresAt: Date;
    invitedById: string;
  }) {
    return this.prisma.invitation.create({ data });
  }

  findPendingInvitation(companyId: string, email: string) {
    return this.prisma.invitation.findFirst({
      where: {
        companyId,
        email: { equals: email, mode: "insensitive" },
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });
  }

  markInvitationAccepted(companyId: string, email: string) {
    return this.prisma.invitation.updateMany({
      where: {
        companyId,
        email: { equals: email, mode: "insensitive" },
        status: "PENDING",
      },
      data: { status: "ACCEPTED" },
    });
  }

  validateBranchIds(companyId: string, branchIds: string[]) {
    if (branchIds.length === 0) return Promise.resolve([]);
    return this.prisma.branch.findMany({
      where: { companyId, id: { in: branchIds } },
      select: { id: true },
    });
  }
}
