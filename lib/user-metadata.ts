export type PrimaryUseCase =
  | "lead_qualification"
  | "customer_support"
  | "appointment_booking";

export type CallVolumeRange = "1-100" | "100-500" | "500-1000" | "1000+";

export type UserOnboardingMetadata = {
  onboardingComplete?: boolean;
  companyName?: string;
  primaryUseCase?: PrimaryUseCase;
  callVolume?: CallVolumeRange;
  phone?: string;
};

export function getUserMetadata(
  unsafeMetadata: Record<string, unknown> | undefined,
): UserOnboardingMetadata {
  if (!unsafeMetadata) {
    return {};
  }

  return {
    onboardingComplete: Boolean(unsafeMetadata.onboardingComplete),
    companyName:
      typeof unsafeMetadata.companyName === "string"
        ? unsafeMetadata.companyName
        : undefined,
    primaryUseCase: unsafeMetadata.primaryUseCase as
      | PrimaryUseCase
      | undefined,
    callVolume: unsafeMetadata.callVolume as CallVolumeRange | undefined,
    phone:
      typeof unsafeMetadata.phone === "string" ? unsafeMetadata.phone : undefined,
  };
}

export function formatPrimaryUseCase(useCase?: PrimaryUseCase): string {
  switch (useCase) {
    case "lead_qualification":
      return "Lead Qualification";
    case "customer_support":
      return "Customer Support";
    case "appointment_booking":
      return "Appointment Booking";
    default:
      return "";
  }
}
