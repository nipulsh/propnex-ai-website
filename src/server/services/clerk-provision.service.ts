import type { Company, User, UserRole } from "@prisma/client";
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

type ClerkUserSnapshot = {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: { id: string; emailAddress: string }[];
  primaryEmailAddressId: string | null;
  phoneNumbers: { phoneNumber: string }[];
};

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

function getPrimaryEmail(clerkUser: ClerkUserSnapshot): string | null {
  return (
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null
  );
}

async function upsertDbUserFromClerk(
  clerkUserId: string,
  clerkUser: ClerkUserSnapshot,
  phone?: string,
) {
  const primaryEmail = getPrimaryEmail(clerkUser);
  if (!primaryEmail) {
    throw new Error("User email is required");
  }

  return tenantRepo.upsertUser({
    clerkUserId,
    email: primaryEmail,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    phone: phone?.trim() || clerkUser.phoneNumbers[0]?.phoneNumber,
  });
}

async function getActiveCompanyForUser(userId: string) {
  const membership = await prisma.companyMember.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { company: true },
    orderBy: { joinedAt: "desc" },
  });
  return membership?.company ?? null;
}

async function provisionFromClerkOrgMembership(
  dbUser: User,
  membership: {
    role: string;
    organization: { id: string; name: string };
  },
  metadata?: { primaryUseCase?: OnboardingInput["primaryUseCase"]; callVolume?: OnboardingInput["callVolume"] },
): Promise<Company> {
  const org = membership.organization;

  let company = await tenantRepo.findCompanyByClerkOrgId(org.id);
  if (!company) {
    company = await tenantRepo.upsertCompany({
      clerkOrganizationId: org.id,
      name: org.name,
      slug: companySlugFromName(org.name),
      primaryUseCase: metadata?.primaryUseCase,
      callVolume: metadata?.callVolume,
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

async function getClerkOrgMemberships(clerkUserId: string) {
  const client = await clerkClient();
  try {
    return await client.users.getOrganizationMembershipList({
      userId: clerkUserId,
      limit: 10,
    });
  } catch (error) {
    if (isClerkOrganizationsDisabled(error)) {
      return { data: [], totalCount: 0 };
    }
    throw error;
  }
}

async function provisionTenantInDatabase(
  clerkUserId: string,
  input: OnboardingInput,
  clerkUser: ClerkUserSnapshot,
) {
  const dbUser = await upsertDbUserFromClerk(clerkUserId, clerkUser, input.phone);

  const existingCompany = await getActiveCompanyForUser(dbUser.id);
  if (existingCompany) {
    return { company: existingCompany, user: dbUser };
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

  const dbUser = await upsertDbUserFromClerk(clerkUserId, clerkUser, input.phone);

  const existingCompany = await getActiveCompanyForUser(dbUser.id);
  if (existingCompany) {
    return { company: existingCompany, user: dbUser, organizationId: existingCompany.clerkOrganizationId };
  }

  const orgMemberships = await getClerkOrgMemberships(clerkUserId);
  if (orgMemberships.data.length > 0) {
    const company = await provisionFromClerkOrgMembership(
      dbUser,
      orgMemberships.data[0],
      {
        primaryUseCase: input.primaryUseCase,
        callVolume: input.callVolume,
      },
    );
    return {
      company,
      user: dbUser,
      organizationId: company.clerkOrganizationId,
    };
  }

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

  const metadata = getUserMetadata(
    clerkUser.unsafeMetadata as Record<string, unknown>,
  );

  let dbUser;
  try {
    dbUser = await upsertDbUserFromClerk(
      clerkUserId,
      clerkUser,
      metadata.phone,
    );
  } catch {
    return null;
  }

  const existingCompany = await getActiveCompanyForUser(dbUser.id);
  if (existingCompany) {
    return existingCompany;
  }

  const orgMemberships = await getClerkOrgMemberships(clerkUserId);

  if (orgMemberships.data.length > 0) {
    return provisionFromClerkOrgMembership(dbUser, orgMemberships.data[0], {
      primaryUseCase: metadata.primaryUseCase,
      callVolume: metadata.callVolume,
    });
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

async function ensureMembershipFromWebhook(
  clerkOrganizationId: string,
  clerkUserId: string,
  role: UserRole,
) {
  let company = await tenantRepo.findCompanyByClerkOrgId(clerkOrganizationId);
  let user = await tenantRepo.findUserByClerkId(clerkUserId);

  if (!company) {
    const client = await clerkClient();
    try {
      const org = await client.organizations.getOrganization({
        organizationId: clerkOrganizationId,
      });
      company = await tenantRepo.upsertCompany({
        clerkOrganizationId: org.id,
        name: org.name,
        slug: companySlugFromName(org.name),
      });
    } catch {
      return;
    }
  }

  if (!user) {
    const client = await clerkClient();
    try {
      const clerkUser = await client.users.getUser(clerkUserId);
      user = await upsertDbUserFromClerk(clerkUserId, clerkUser);
    } catch {
      return;
    }
  }

  await tenantRepo.upsertMembership({
    companyId: company.id,
    userId: user.id,
    role,
  });

  await ensureCreditBalance(company.id);
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

      if (!clerkOrganizationId || !clerkUserId) return;

      await ensureMembershipFromWebhook(clerkOrganizationId, clerkUserId, role);
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
