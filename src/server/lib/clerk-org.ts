import { clerkClient } from "@clerk/nextjs/server";

import { isClerkOrganizationsDisabled } from "@/server/lib/clerk-errors";
import { ValidationError } from "@/server/lib/errors";
import prisma from "@/server/lib/prisma";

type CompanyOrgFields = {
  id: string;
  name: string;
  clerkOrganizationId: string | null;
  ownerUserId: string | null;
};

/**
 * Returns a real Clerk org id (`org_…`). Upgrades legacy `local:` ids when
 * Clerk Organizations is enabled; otherwise throws a clear validation error.
 */
export async function ensureRealClerkOrganizationId(
  company: CompanyOrgFields,
): Promise<string> {
  if (company.clerkOrganizationId?.startsWith("org_")) {
    return company.clerkOrganizationId;
  }

  const clerkUserId = company.ownerUserId;
  if (!clerkUserId) {
    throw new ValidationError(
      "Organization invitations require a company owner with a linked Clerk account",
    );
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
      throw new ValidationError(
        "Employee invitations require Clerk Organizations. Enable Organizations in your Clerk Dashboard (dashboard.clerk.com), then try sending the invite again.",
      );
    }
    throw error;
  }
}
