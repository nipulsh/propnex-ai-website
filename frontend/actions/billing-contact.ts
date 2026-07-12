"use server";

import {
  type BillingContactRequestInput,
  validateBillingContactRequest,
} from "@/lib/billing-contact";
import { createGraphQLContext } from "@/server/graphql/context";
import { tenantService } from "@/server/services/tenant.service";
import { eventsService } from "@/server/services/events.service";
import { PERMISSIONS } from "@/server/types/permissions";

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
    const ctx = await createGraphQLContext();
    tenantService.requirePermission(ctx, PERMISSIONS.BILLING_READ);
    const event = await eventsService.emit(ctx, {
      type: "BILLING_ALERT",
      entityType: "billing_contact_request",
      title: `Billing request: ${input.intent}`,
      payload: {
        intent: input.intent,
        quantity: input.quantity,
        phone: input.phone?.trim() || null,
        notes: input.notes?.trim() || null,
        submittedAt: new Date().toISOString(),
      },
    });

    return { success: true, requestId: event.id };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit your request right now.";
    console.error("submitBillingContactRequest failed:", error);
    return { success: false, error: message };
  }
}
