"use server";

import { inviteEmployee } from "@/lib/graphql/api";
import { graphqlErrorMessage } from "@/lib/graphql/auth-error";
import {
  formatInviteEmployeeErrors,
  inviteEmployeeSchema,
  type InviteEmployeeInput,
} from "@/lib/validations/invite-employee";

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
    const result = await inviteEmployee({
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

    return { success: true, employeeId: result.employees.invite.id };
  } catch (error) {
    return { success: false, error: graphqlErrorMessage(error, "Unable to send invitation.") };
  }
}
