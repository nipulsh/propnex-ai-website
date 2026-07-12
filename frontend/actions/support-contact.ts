"use server";

import { backendFetch } from "@/lib/api/backend-client";

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
    const res = await backendFetch("/events/support-contact", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { requestId?: string; error?: string };

    if (!res.ok) {
      return { success: false, error: data.error ?? "Unable to submit your support query right now." };
    }

    return { success: true, requestId: data.requestId! };
  } catch (error) {
    console.error("submitBranchSupportRequest failed:", error);
    return { success: false, error: "Unable to submit your support query right now." };
  }
}
