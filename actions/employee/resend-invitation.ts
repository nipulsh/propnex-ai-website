"use server";

import { createGraphQLContext } from "@/server/graphql/context";
import { isAppError } from "@/server/lib/errors";
import { employeesService } from "@/server/services/employees.service";

export type ResendInvitationResult =
  | { success: true; employeeId: string }
  | { success: false; error: string };

export async function resendInvitation(
  employeeId: string,
): Promise<ResendInvitationResult> {
  try {
    const ctx = await createGraphQLContext();
    const employee = await employeesService.resendInvite(ctx, employeeId);
    return { success: true, employeeId: employee.id };
  } catch (error) {
    if (isAppError(error)) {
      return { success: false, error: error.message };
    }
    const message =
      error instanceof Error ? error.message : "Unable to resend invitation.";
    return { success: false, error: message };
  }
}
