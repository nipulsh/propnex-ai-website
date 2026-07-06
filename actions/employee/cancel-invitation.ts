"use server";

import { createGraphQLContext } from "@/server/graphql/context";
import { isAppError } from "@/server/lib/errors";
import { employeesService } from "@/server/services/employees.service";

export type CancelInvitationResult =
  | { success: true }
  | { success: false; error: string };

export async function cancelInvitation(
  employeeId: string,
): Promise<CancelInvitationResult> {
  try {
    const ctx = await createGraphQLContext();
    await employeesService.cancelInvite(ctx, employeeId);
    return { success: true };
  } catch (error) {
    if (isAppError(error)) {
      return { success: false, error: error.message };
    }
    const message =
      error instanceof Error ? error.message : "Unable to cancel invitation.";
    return { success: false, error: message };
  }
}
