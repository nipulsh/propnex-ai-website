"use server";

import {
  type BillingContactRequestInput,
  validateBillingContactRequest,
} from "@/lib/billing-contact";
import { backendFetch } from "@/lib/api/backend-client";

export type SubmitBillingContactResult =
  | { success: true; requestId: string }
  | { success: false; error: string };

export async function submitBillingContactRequest(
  input: BillingContactRequestInput,
): Promise<SubmitBillingContactResult> {
  const validationError = validateBillingContactRequest(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const res = await backendFetch("/events/billing-contact", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { requestId?: string; error?: string };

    if (!res.ok) {
      return { success: false, error: data.error ?? "Unable to submit your request right now." };
    }

    return { success: true, requestId: data.requestId! };
  } catch (error) {
    console.error("submitBillingContactRequest failed:", error);
    return { success: false, error: "Unable to submit your request right now." };
  }
}
