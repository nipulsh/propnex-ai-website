import type { UserRole } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

import type { OnboardingInput } from "@/lib/onboarding.server";
import { companySlugFromName } from "@/server/lib/clerk-sync";
import prisma from "@/server/lib/prisma";
import { TenantRepository } from "@/server/repositories/tenant.repository";

const tenantRepo = new TenantRepository(prisma);

function mapClerkRoleToUserRole(role: string): UserRole {
  switch (role) {
    case "org:admin":
      return "ADMIN";
    default:
      return "AGENT";
  }
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

  await prisma.creditBalance.upsert({
    where: { companyId: company.id },
    create: {
      companyId: company.id,
      creditsRemaining: 2000,
      creditsUsed: 0,
    },
    update: {},
  });

  return { company, user: dbUser, organizationId: org.id };
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
