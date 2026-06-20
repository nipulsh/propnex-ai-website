import { clerkClient } from "@clerk/nextjs/server";
import type { CallVolumeRange, PrimaryUseCase } from "@prisma/client";
import type { JwtPayload } from "@clerk/shared/types";

export type OnboardingInput = {
  companyName: string;
  phone?: string;
  primaryUseCase: PrimaryUseCase;
  callVolume: CallVolumeRange;
};

export async function isOnboardingComplete(
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
