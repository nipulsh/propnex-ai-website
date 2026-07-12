"use server";

import { cancelEmployeeInvite } from "@/lib/graphql/api";
import { graphqlErrorMessage } from "@/lib/graphql/auth-error";

export type CancelInvitationResult =
  | { success: true }
  | { success: false; error: string };

export async function cancelInvitation(
  employeeId: string,
): Promise<CancelInvitationResult> {
  try {
    await cancelEmployeeInvite(employeeId);
    return { success: true };
  } catch (error) {
    return { success: false, error: graphqlErrorMessage(error, "Unable to cancel invitation.") };
  }
}
