"use server";

import {
  formatInviteEmployeeErrors,
  inviteEmployeeSchema,
  type InviteEmployeeInput,
} from "@/lib/validations/invite-employee";
import { createGraphQLContext } from "@/server/graphql/context";
import { isAppError } from "@/server/lib/errors";
import { employeesService } from "@/server/services/employees.service";

export type SendInvitationResult =
  | { success: true; employeeId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function sendInvitation(
  input: InviteEmployeeInput,
): Promise<SendInvitationResult> {
  const parsed = inviteEmployeeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: formatInviteEmployeeErrors(parsed.error),
    };
  }

  try {
    const ctx = await createGraphQLContext();
    const employee = await employeesService.invite(ctx, {
      name: parsed.data.name,
      email: parsed.data.email,
      jobTitle: parsed.data.jobTitle,
      role: parsed.data.role,
      branchAccessType: parsed.data.branchAccessType,
      branchIds:
        parsed.data.branchAccessType === "SELECTED"
          ? parsed.data.branchIds
          : undefined,
    });

    return { success: true, employeeId: employee.id };
  } catch (error) {
    if (isAppError(error)) {
      return { success: false, error: error.message };
    }
    const message =
      error instanceof Error ? error.message : "Unable to send invitation.";
    return { success: false, error: message };
  }
}
