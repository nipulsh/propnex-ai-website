"use server";

import { resendEmployeeInvite } from "@/lib/graphql/api";
import { graphqlErrorMessage } from "@/lib/graphql/auth-error";

export type ResendInvitationResult =
  | { success: true; employeeId: string }
  | { success: false; error: string };

export async function resendInvitation(
  employeeId: string,
): Promise<ResendInvitationResult> {
  try {
    const result = await resendEmployeeInvite(employeeId);
    return { success: true, employeeId: result.employees.resendInvite.id };
  } catch (error) {
    return { success: false, error: graphqlErrorMessage(error, "Unable to resend invitation.") };
  }
}
