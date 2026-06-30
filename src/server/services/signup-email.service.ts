import prisma from "@/server/lib/prisma";

export type SignupEmailCheckResult =
  | { available: true }
  | {
      available: false;
      reason:
        | "invalid_contract"
        | "already_registered"
        | "assigned_email_mismatch";
      message: string;
      companyName?: string;
    };

const ASSIGNED_EMAIL_MISMATCH_MESSAGE =
  "Another email ID is assigned to the company.";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findUserByEmail(email: string) {
  const trimmed = email.trim();
  const lowered = normalizeEmail(email);

  const exactMatch = await prisma.user.findUnique({
    where: { email: trimmed },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (exactMatch) {
    return exactMatch;
  }

  if (trimmed === lowered) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: lowered },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });
}

function getCompanyAssignedEmail(company: {
  contact: { email: string } | null;
  members: { user: { email: string } }[];
}): string | null {
  return company.contact?.email ?? company.members[0]?.user.email ?? null;
}

export async function checkEmailAvailableForContractSignup(
  email: string,
  contractId: string,
): Promise<SignupEmailCheckResult> {
  const normalizedEmail = normalizeEmail(email);

  const targetCompany = await prisma.company.findUnique({
    where: { contractId },
    select: {
      id: true,
      name: true,
      ownerUserId: true,
      contact: { select: { email: true } },
      members: {
        where: { role: "OWNER", status: "ACTIVE" },
        take: 1,
        include: { user: { select: { email: true } } },
      },
    },
  });

  if (!targetCompany) {
    return {
      available: false,
      reason: "invalid_contract",
      message:
        "Your Contract ID is no longer valid. Please restart onboarding.",
    };
  }

  const assignedEmail = getCompanyAssignedEmail(targetCompany);
  if (
    assignedEmail &&
    normalizedEmail !== normalizeEmail(assignedEmail)
  ) {
    return {
      available: false,
      reason: "assigned_email_mismatch",
      message: ASSIGNED_EMAIL_MISMATCH_MESSAGE,
      companyName: targetCompany.name,
    };
  }

  if (targetCompany.ownerUserId != null) {
    return {
      available: false,
      reason: "invalid_contract",
      message:
        "Your Contract ID is no longer valid. Please restart onboarding.",
    };
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (!existingUser) {
    return { available: true };
  }

  const otherCompanyMembership = existingUser.memberships.find(
    (membership) => membership.companyId !== targetCompany.id,
  );

  if (!otherCompanyMembership) {
    return { available: true };
  }

  return {
    available: false,
    reason: "already_registered",
    message: `This email is already registered with ${otherCompanyMembership.company.name}. Please sign up with a different email address.`,
    companyName: otherCompanyMembership.company.name,
  };
}

export async function assertEmailAvailableForContractSignup(
  email: string,
  contractId: string,
): Promise<void> {
  const result = await checkEmailAvailableForContractSignup(email, contractId);
  if (!result.available) {
    throw new Error(result.message);
  }
}
