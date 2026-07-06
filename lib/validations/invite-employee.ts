import { z } from "zod";

export const inviteEmployeeSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().email("Enter a valid email"),
    jobTitle: z.string().trim().min(1, "Job title is required"),
    role: z.enum(["ADMIN", "MANAGER", "SALES", "SUPPORT", "AGENT"]),
    branchAccessType: z.enum(["ALL", "SELECTED"]),
    branchIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.branchAccessType === "SELECTED") {
      const ids = data.branchIds ?? [];
      if (ids.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select at least one branch",
          path: ["branchIds"],
        });
      }
    }
  });

export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;

export function formatInviteEmployeeErrors(
  error: z.ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
