import { clerkClient } from "@clerk/nextjs/server";
import type { CallVolumeRange, PrimaryUseCase } from "@prisma/client";
import type { JwtPayload } from "@clerk/shared/types";

import prisma from "@/server/lib/prisma";

export type OnboardingInput = {
  companyName: string;
  phone?: string;
  primaryUseCase: PrimaryUseCase;
  callVolume: CallVolumeRange;
};

async function isClerkOnboardingComplete(
  userId: string,
  sessionClaims?: JwtPayload,
): Promise<boolean> {
  if (sessionClaims?.metadata?.onboardingComplete === true) {
    return true;
  }

  const publicMetadata = (
    sessionClaims as { publicMetadata?: { onboardingComplete?: boolean } } | undefined
  )?.publicMetadata;
  if (publicMetadata?.onboardingComplete === true) {
    return true;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.onboardingComplete === true;
  } catch {
    return false;
  }
}

/** True when the user has an active company membership in MongoDB. */
export async function hasActiveTenant(clerkUserId: string): Promise<boolean> {
  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  if (!dbUser) {
    return false;
  }

  const membership = await prisma.companyMember.findFirst({
    where: { userId: dbUser.id, status: "ACTIVE" },
    select: { id: true },
  });

  return Boolean(membership);
}

export async function isOnboardingComplete(
  userId: string,
  sessionClaims?: JwtPayload,
): Promise<boolean> {
  const clerkComplete = await isClerkOnboardingComplete(userId, sessionClaims);
  if (!clerkComplete) {
    return false;
  }

  return hasActiveTenant(userId);
}

export async function saveOnboarding(
  userId: string,
  input: OnboardingInput,
): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    unsafeMetadata: {
      onboardingComplete: true,
      companyName: input.companyName.trim(),
      phone: input.phone?.trim() ?? "",
      primaryUseCase: input.primaryUseCase,
      callVolume: input.callVolume,
    },
    publicMetadata: {
      onboardingComplete: true,
    },
  });
}
