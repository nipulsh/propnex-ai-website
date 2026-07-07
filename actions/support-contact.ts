"use server";

import { createGraphQLContext } from "@/server/graphql/context";
import { eventsService } from "@/server/services/events.service";

export type SubmitSupportRequestResult =
  | { success: true; requestId: string }
  | { success: false; error: string };

export async function submitBranchSupportRequest(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SubmitSupportRequestResult> {
  if (!input.name.trim()) return { success: false, error: "Full Name is required." };
  if (!input.email.trim()) return { success: false, error: "Email is required." };
  if (!input.subject.trim()) return { success: false, error: "Subject is required." };
  if (!input.message.trim()) return { success: false, error: "Query / Message is required." };

  try {
    const ctx = await createGraphQLContext();
    const event = await eventsService.emit(ctx, {
      type: "BILLING_ALERT",
      entityType: "support_contact_request",
      title: `Branch support: ${input.subject}`,
      payload: {
        name: input.name.trim(),
        email: input.email.trim(),
        subject: input.subject.trim(),
        message: input.message.trim(),
        submittedAt: new Date().toISOString(),
      },
    });

    return { success: true, requestId: event.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit your support query right now.";
    console.error("submitBranchSupportRequest failed:", error);
    return { success: false, error: message };
  }
}
