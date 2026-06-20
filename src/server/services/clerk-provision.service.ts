import type { UserRole } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

import type { OnboardingInput } from "@/lib/onboarding.server";
import { getUserMetadata } from "@/lib/user-metadata";
import {
  isClerkOrganizationsDisabled,
} from "@/server/lib/clerk-errors";
import { companySlugFromName, mapClerkRoleToUserRole } from "@/server/lib/clerk-sync";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";

const tenantRepo = new TenantRepository(prisma);

async function ensureCreditBalance(companyId: string) {
  await prisma.creditBalance.upsert({
    where: { companyId },
    create: {
      companyId,
      creditsRemaining: 2000,
      creditsUsed: 0,
    },
    update: {},
  });
}

async function provisionTenantInDatabase(
  clerkUserId: string,
  input: OnboardingInput,
  clerkUser: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    emailAddresses: { id: string; emailAddress: string }[];
    primaryEmailAddressId: string | null;
    phoneNumbers: { phoneNumber: string }[];
  },
) {
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new Error("User email is required");
  }

  const dbUser = await tenantRepo.upsertUser({
    clerkUserId,
    email: primaryEmail,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    phone: input.phone?.trim() || clerkUser.phoneNumbers[0]?.phoneNumber,
  });

  const existingMembership = await prisma.companyMember.findFirst({
    where: { userId: dbUser.id, status: "ACTIVE" },
    include: { company: true },
    orderBy: { joinedAt: "desc" },
  });
  if (existingMembership?.company) {
    return { company: existingMembership.company, user: dbUser };
  }

  const company = await prisma.company.create({
    data: {
      clerkOrganizationId: null,
      name: input.companyName.trim(),
      slug: companySlugFromName(input.companyName),
      primaryUseCase: input.primaryUseCase,
      callVolume: input.callVolume,
    },
  });

  await tenantRepo.upsertMembership({
    companyId: company.id,
    userId: dbUser.id,
    role: "OWNER",
  });

  await ensureCreditBalance(company.id);

  return { company, user: dbUser };
}

export async function provisionOrganizationForUser(
  clerkUserId: string,
  input: OnboardingInput,
) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new Error("User email is required");
  }

  const dbUser = await tenantRepo.upsertUser({
    clerkUserId,
    email: primaryEmail,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    phone: input.phone?.trim() || clerkUser.phoneNumbers[0]?.phoneNumber,
  });

  try {
    const org = await client.organizations.createOrganization({
      name: input.companyName.trim(),
      createdBy: clerkUserId,
    });

    const company = await tenantRepo.upsertCompany({
      clerkOrganizationId: org.id,
      name: input.companyName.trim(),
      slug: companySlugFromName(input.companyName),
      primaryUseCase: input.primaryUseCase,
      callVolume: input.callVolume,
    });

    await tenantRepo.upsertMembership({
      companyId: company.id,
      userId: dbUser.id,
      role: "OWNER",
    });

    await ensureCreditBalance(company.id);

    return { company, user: dbUser, organizationId: org.id };
  } catch (error) {
    if (isClerkOrganizationsDisabled(error)) {
      const { company } = await provisionTenantInDatabase(
        clerkUserId,
        input,
        clerkUser,
      );
      return { company, user: dbUser, organizationId: null };
    }

    throw error;
  }
}

/**
 * Repairs MongoDB tenant records when Clerk auth exists but company/membership
 * were never provisioned (e.g. onboarding completed before DB was available).
 */
export async function syncTenantFromClerk(clerkUserId: string) {
  const client = await clerkClient();
  let clerkUser;
  try {
    clerkUser = await client.users.getUser(clerkUserId);
  } catch {
    return null;
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return null;
  }

  const metadata = getUserMetadata(
    clerkUser.unsafeMetadata as Record<string, unknown>,
  );

  const dbUser = await tenantRepo.upsertUser({
    clerkUserId,
    email: primaryEmail,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    phone: metadata.phone ?? clerkUser.phoneNumbers[0]?.phoneNumber,
  });

  let orgMemberships: Awaited<
    ReturnType<typeof client.users.getOrganizationMembershipList>
  > = { data: [], totalCount: 0 };

  try {
    orgMemberships = await client.users.getOrganizationMembershipList({
      userId: clerkUserId,
      limit: 10,
    });
  } catch (error) {
    if (!isClerkOrganizationsDisabled(error)) {
      throw error;
    }
  }

  if (orgMemberships.data.length > 0) {
    const membership = orgMemberships.data[0];
    const org = membership.organization;

    let company = await tenantRepo.findCompanyByClerkOrgId(org.id);
    if (!company) {
      company = await tenantRepo.upsertCompany({
        clerkOrganizationId: org.id,
        name: org.name,
        slug: companySlugFromName(org.name),
        primaryUseCase: metadata.primaryUseCase,
        callVolume: metadata.callVolume,
      });
    }

    const role: UserRole =
      membership.role === "org:admin"
        ? "OWNER"
        : mapClerkRoleToUserRole(membership.role);

    await tenantRepo.upsertMembership({
      companyId: company.id,
      userId: dbUser.id,
      role,
    });

    await ensureCreditBalance(company.id);
    return company;
  }

  if (
    clerkUser.publicMetadata?.onboardingComplete &&
    metadata.companyName &&
    metadata.primaryUseCase &&
    metadata.callVolume
  ) {
    const result = await provisionOrganizationForUser(clerkUserId, {
      companyName: metadata.companyName,
      phone: metadata.phone,
      primaryUseCase: metadata.primaryUseCase,
      callVolume: metadata.callVolume,
    });
    return result.company;
  }

  return null;
}

export async function handleClerkWebhookEvent(
  type: string,
  data: Record<string, unknown>,
) {
  switch (type) {
    case "user.created":
    case "user.updated": {
      const clerkUserId = data.id as string;
      const email =
        (data.email_addresses as { email_address: string }[])?.[0]
          ?.email_address ?? "";
      if (!clerkUserId || !email) return;

      await tenantRepo.upsertUser({
        clerkUserId,
        email,
        firstName: (data.first_name as string) ?? null,
        lastName: (data.last_name as string) ?? null,
        imageUrl: (data.image_url as string) ?? null,
      });
      break;
    }

    case "organization.created":
    case "organization.updated": {
      const clerkOrganizationId = data.id as string;
      const name = (data.name as string) ?? "Company";
      if (!clerkOrganizationId) return;

      await tenantRepo.upsertCompany({
        clerkOrganizationId,
        name,
        slug: companySlugFromName(name),
      });
      break;
    }

    case "organizationMembership.created":
    case "organizationMembership.updated": {
      const clerkOrganizationId = data.organization_id as string;
      const clerkUserId = data.public_user_data
        ? (data.public_user_data as { user_id: string }).user_id
        : (data.user_id as string);
      const role = mapClerkRoleToUserRole((data.role as string) ?? "org:member");

      const company =
        await tenantRepo.findCompanyByClerkOrgId(clerkOrganizationId);
      const user = await tenantRepo.findUserByClerkId(clerkUserId);
      if (!company || !user) return;

      await tenantRepo.upsertMembership({
        companyId: company.id,
        userId: user.id,
        role,
      });
      break;
    }

    case "organizationMembership.deleted": {
      const clerkOrganizationId = data.organization_id as string;
      const clerkUserId = data.public_user_data
        ? (data.public_user_data as { user_id: string }).user_id
        : (data.user_id as string);

      const company =
        await tenantRepo.findCompanyByClerkOrgId(clerkOrganizationId);
      const user = await tenantRepo.findUserByClerkId(clerkUserId);
      if (!company || !user) return;

      await prisma.companyMember.updateMany({
        where: { companyId: company.id, userId: user.id },
        data: { status: "REMOVED" },
      });
      break;
    }

    default:
      break;
  }
}
