import { clerkClient } from "@clerk/nextjs/server";

import {
  clearPendingContractCookie,
  getPendingContractCookie,
} from "@/lib/pending-contract-cookie";
import { hasActiveTenant } from "@/lib/onboarding.server";
import { isClerkOrganizationsDisabled } from "@/server/lib/clerk-errors";
import { localClerkOrganizationId } from "@/server/lib/clerk-sync";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";
import { assertEmailAvailableForContractSignup } from "@/server/services/signup-email.service";

const tenantRepo = new TenantRepository(prisma);

type ClerkUserSnapshot = {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: { id: string; emailAddress: string }[];
  primaryEmailAddressId: string | null;
  phoneNumbers: { phoneNumber: string }[];
};

function getPrimaryEmail(clerkUser: ClerkUserSnapshot): string {
  return (
    clerkUser.emailAddresses.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    ""
  );
}

async function ensureCreditBalance(companyId: string) {
  await prisma.creditBalance.upsert({
    where: { companyId },
    create: {
      companyId,
      creditsRemaining: 0,
      creditsUsed: 0,
    },
    update: {},
  });
}

async function attachClerkOrganization(
  clerkUserId: string,
  company: { id: string; name: string; clerkOrganizationId: string | null },
) {
  if (company.clerkOrganizationId) {
    return company.clerkOrganizationId;
  }

  const client = await clerkClient();

  try {
    const org = await client.organizations.createOrganization({
      name: company.name,
      createdBy: clerkUserId,
    });

    await prisma.company.update({
      where: { id: company.id },
      data: { clerkOrganizationId: org.id },
    });

    return org.id;
  } catch (error) {
    if (isClerkOrganizationsDisabled(error)) {
      const localOrgId = localClerkOrganizationId(clerkUserId);
      await prisma.company.update({
        where: { id: company.id },
        data: { clerkOrganizationId: localOrgId },
      });
      return localOrgId;
    }

    throw error;
  }
}

export async function claimCompanyForUser(clerkUserId: string) {
  if (await hasActiveTenant(clerkUserId)) {
    await clearPendingContractCookie();
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { onboardingComplete: true },
    });
    const dbUser = await tenantRepo.findUserByClerkId(clerkUserId);
    const membership = dbUser
      ? await prisma.companyMember.findFirst({
          where: { userId: dbUser.id, status: "ACTIVE" },
          include: { company: true },
        })
      : null;
    if (membership?.company) {
      return { company: membership.company, user: dbUser! };
    }
  }

  const contractId = await getPendingContractCookie();
  if (!contractId) {
    throw new Error(
      "No pending Contract ID found. Please validate your Contract ID again.",
    );
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);
  const primaryEmail = getPrimaryEmail(clerkUser);
  if (!primaryEmail) {
    throw new Error("User email is required to complete signup.");
  }

  await assertEmailAvailableForContractSignup(primaryEmail, contractId);

  const claimResult = await prisma.company.updateMany({
    where: {
      contractId,
      ownerUserId: null,
    },
    data: {
      ownerUserId: clerkUserId,
      claimedAt: new Date(),
    },
  });

  if (claimResult.count === 0) {
    throw new Error("This Contract ID has already been claimed.");
  }

  const company = await prisma.company.findUnique({
    where: { contractId },
  });

  if (!company) {
    throw new Error("Invalid Contract ID.");
  }

  const dbUser = await tenantRepo.upsertUser({
    clerkUserId,
    email: primaryEmail,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    phone: clerkUser.phoneNumbers[0]?.phoneNumber,
  });

  await attachClerkOrganization(clerkUserId, company);

  const refreshedCompany = await prisma.company.findUniqueOrThrow({
    where: { id: company.id },
  });

  await tenantRepo.upsertMembership({
    companyId: refreshedCompany.id,
    userId: dbUser.id,
    role: "OWNER",
  });
  await ensureCreditBalance(refreshedCompany.id);

  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      onboardingComplete: true,
    },
    unsafeMetadata: {
      onboardingComplete: true,
      companyName: refreshedCompany.name,
    },
  });

  await clearPendingContractCookie();

  return {
    company: refreshedCompany,
    user: dbUser,
  };
}
