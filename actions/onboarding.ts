"use server";

import { auth } from "@clerk/nextjs/server";

import { claimCompanyForUser } from "@/server/services/contract-claim.service";

export type ClaimOnboardingResult =
  | { success: true }
  | { success: false; error: string };

export async function claimOnboarding(): Promise<ClaimOnboardingResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in to continue." };
  }

  try {
    await claimCompanyForUser(userId);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while setting up your account.";
    console.error("claimOnboarding failed:", error);
    return { success: false, error: message };
  }
}
