"use server";

import { auth } from "@clerk/nextjs/server";

import { saveOnboarding, type OnboardingInput } from "@/lib/onboarding.server";
import {
  parseCallVolumeRange,
  parsePrimaryUseCase,
} from "@/lib/user-metadata";
import { provisionOrganizationForUser } from "@/server/services/clerk-provision.service";

export async function completeOnboarding(input: OnboardingInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const primaryUseCase = parsePrimaryUseCase(input.primaryUseCase);
  const callVolume = parseCallVolumeRange(input.callVolume);

  if (!input.companyName?.trim() || !primaryUseCase || !callVolume) {
    throw new Error("Missing or invalid required fields");
  }

  const validatedInput: OnboardingInput = {
    companyName: input.companyName.trim(),
    phone: input.phone?.trim(),
    primaryUseCase,
    callVolume,
  };

  await saveOnboarding(userId, validatedInput);
  await provisionOrganizationForUser(userId, validatedInput);
}
