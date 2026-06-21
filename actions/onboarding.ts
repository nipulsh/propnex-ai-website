"use server";

import { auth } from "@clerk/nextjs/server";

import { saveOnboarding, type OnboardingInput } from "@/lib/onboarding.server";
import {
  parseCallVolumeRange,
  parsePrimaryUseCase,
} from "@/lib/user-metadata";
import { provisionOrganizationForUser } from "@/server/services/clerk-provision.service";

export type CompleteOnboardingResult =
  | { success: true }
  | { success: false; error: string };

export async function completeOnboarding(
  input: OnboardingInput,
): Promise<CompleteOnboardingResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in to continue." };
  }

  const primaryUseCase = parsePrimaryUseCase(input.primaryUseCase);
  const callVolume = parseCallVolumeRange(input.callVolume);

  if (!input.companyName?.trim() || !primaryUseCase || !callVolume) {
    return {
      success: false,
      error: "Please fill in all required onboarding fields.",
    };
  }

  const validatedInput: OnboardingInput = {
    companyName: input.companyName.trim(),
    phone: input.phone?.trim(),
    primaryUseCase,
    callVolume,
  };

  try {
    await provisionOrganizationForUser(userId, validatedInput);
    await saveOnboarding(userId, validatedInput);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while setting up your account.";
    console.error("completeOnboarding failed:", error);
    return { success: false, error: message };
  }
}
