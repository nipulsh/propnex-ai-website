import prisma from "@/server/lib/prisma";
import { NotFoundError, ValidationError } from "@/server/lib/errors";

export async function getPublicBranchInvitation(token: string) {
  const invitation = await prisma.branchInvitation.findUnique({
    where: { token },
    include: { branch: true, company: true },
  });

  if (!invitation) {
    return { status: "not_found" as const };
  }

  const isExpired = invitation.expiresAt <= new Date();

  return {
    status: (isExpired ? "expired" : invitation.status.toLowerCase()) as
      | "pending"
      | "accepted"
      | "cancelled"
      | "expired",
    email: invitation.email,
    branchName: invitation.branch.name,
    companyName: invitation.company.name,
    expiresAt: invitation.expiresAt.toISOString(),
  };
}

type AcceptArgs = {
  token: string;
  clerkUserId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
};

export async function acceptBranchInvitation({
  token,
  clerkUserId,
  email,
  firstName,
  lastName,
  imageUrl,
}: AcceptArgs) {
  const invitation = await prisma.branchInvitation.findUnique({
    where: { token },
    include: { branch: true, company: true },
  });

  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt <= new Date()) {
    throw new NotFoundError("Invitation is invalid, expired, or already used");
  }

  if (email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new ValidationError("This invitation was sent to a different email address");
  }

  await prisma.$transaction(async (tx) => {
    const current = await tx.branchInvitation.findUnique({ where: { id: invitation.id } });
    if (!current || current.status !== "PENDING") {
      throw new ValidationError("Invitation is no longer pending");
    }

    await tx.branchInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    let dbUser = await tx.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (dbUser) {
      if (dbUser.clerkUserId !== clerkUserId) {
        dbUser = await tx.user.update({
          where: { id: dbUser.id },
          data: { clerkUserId, status: "ACTIVE" },
        });
      }
    } else {
      dbUser = await tx.user.create({
        data: { clerkUserId, email, firstName, lastName, imageUrl, status: "ACTIVE" },
      });
    }

    const member = await tx.companyMember.upsert({
      where: { companyId_userId: { companyId: invitation.companyId, userId: dbUser.id } },
      create: {
        companyId: invitation.companyId,
        userId: dbUser.id,
        role: "ADMIN",
        branchAccessType: "SELECTED",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
      update: {
        role: "ADMIN",
        branchAccessType: "SELECTED",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    });

    await tx.memberBranchAccess.upsert({
      where: { memberId_branchId: { memberId: member.id, branchId: invitation.branchId } },
      create: { memberId: member.id, branchId: invitation.branchId },
      update: {},
    });
  });

  return {
    clerkOrganizationId: invitation.company.clerkOrganizationId,
    branchName: invitation.branch.name,
    companyName: invitation.company.name,
  };
}
