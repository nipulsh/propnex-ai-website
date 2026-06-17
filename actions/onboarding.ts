"use server";

import { auth } from "@clerk/nextjs/server";

import { saveOnboarding, type OnboardingInput } from "@/lib/onboarding.server";

export async function completeOnboarding(input: OnboardingInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!input.companyName?.trim() || !input.primaryUseCase || !input.callVolume) {
    throw new Error("Missing required fields");
  }

  await saveOnboarding(userId, input);
}
