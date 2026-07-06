"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { cancelInvitation } from "@/actions/employee/cancel-invitation";
import { resendInvitation } from "@/actions/employee/resend-invitation";
import { useSideNotification } from "@/components/common/side-notification";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deactivateEmployee, deleteEmployee } from "@/lib/graphql/api";
import type { EmployeeNode, InvitationDisplayStatus, UserRole } from "@/lib/graphql/queries";
import { ROLE_LABELS } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const INVITATION_STATUS_LABELS: Record<InvitationDisplayStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  EXPIRED: "Expired",
};

const INVITATION_STATUS_STYLES: Record<InvitationDisplayStatus, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  ACCEPTED: "border-success/30 bg-success/10 text-success",
  EXPIRED: "border-propnex-border bg-propnex-bg text-propnex-muted",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function branchLabel(employee: EmployeeNode): string {
  if (employee.branchAccessType === "ALL") return "All Branches";
  if (employee.assignedBranches.length === 0) return "No branches";
  if (employee.assignedBranches.length <= 2) {
    return employee.assignedBranches.map((b) => b.name).join(", ");
  }
  return `${employee.assignedBranches.length} branches`;
}

function toEmployeeTarget(employee: EmployeeNode) {
  return {
    id: employee.id,
    userId: employee.userId,
    role: employee.role as UserRole,
  };
}

type EmployeesTableProps = {
  employees: EmployeeNode[];
  isLoading: boolean;
  onChanged: () => void;
};

export function EmployeesTable({
  employees,
  isLoading,
  onChanged,
}: EmployeesTableProps) {
  const router = useRouter();
  const { notify } = useSideNotification();
  const {
    canResendInvitation,
    canCancelInvitation,
    canDeactivateEmployee,
    canDeleteEmployee,
    canViewEmployee,
    hasPermission,
  } = usePermissions();
  const [actionId, setActionId] = useState<string | null>(null);

  const showActionsColumn =
    hasPermission("employees:write") || hasPermission("employees:invite");

  async function handleAction(
    action: "deactivate" | "delete" | "resend" | "cancel",
    employee: EmployeeNode,
  ) {
    setActionId(employee.id);
    try {
      if (action === "deactivate") {
        await deactivateEmployee(employee.id);
        notify({ type: "success", message: "Employee deactivated." });
      } else if (action === "delete") {
        if (!confirm(`Remove ${employee.name} from the company?`)) return;
        await deleteEmployee(employee.id);
        notify({ type: "success", message: "Employee removed." });
      } else if (action === "resend") {
        const result = await resendInvitation(employee.id);
        if (!result.success) {
          notify({ type: "error", message: result.error });
          return;
        }
        notify({ type: "success", message: "Invitation resent." });
      } else {
        if (!confirm(`Cancel the invitation for ${employee.name}?`)) return;
        const result = await cancelInvitation(employee.id);
        if (!result.success) {
          notify({ type: "error", message: result.error });
          return;
        }
        notify({ type: "success", message: "Invitation cancelled." });
      }
      onChanged();
    } catch (err) {
      notify({
        type: "error",
        message: err instanceof Error ? err.message : "Action failed.",
      });
    } finally {
      setActionId(null);
    }
  }

  const isPendingInvite = (employee: EmployeeNode) =>
    employee.invitationStatus === "PENDING" ||
    employee.invitationStatus === "EXPIRED";

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 z-10 bg-propnex-panel">
        <tr className="border-b border-propnex-border text-left text-[0.7rem] tracking-[0.08em] text-propnex-muted uppercase">
          <th className="px-4 py-3 font-medium">Name</th>
          <th className="px-4 py-3 font-medium">Email</th>
          <th className="px-4 py-3 font-medium">Job Title</th>
          <th className="px-4 py-3 font-medium">Role</th>
          <th className="px-4 py-3 font-medium">Branch Access</th>
          <th className="px-4 py-3 font-medium">Invitation Status</th>
          <th className="px-4 py-3 font-medium">Last Active</th>
          {showActionsColumn ? (
            <th className="px-4 py-3 font-medium">Actions</th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {employees.length === 0 && !isLoading ? (
          <tr>
            <td
              colSpan={showActionsColumn ? 8 : 7}
              className="px-4 py-12 text-center text-sm text-propnex-muted"
            >
              No employees found. Invite your first team member to get started.
            </td>
          </tr>
        ) : null}
        {employees.map((employee) => {
          const target = toEmployeeTarget(employee);
          const canView = canViewEmployee(target);
          const canResend =
            isPendingInvite(employee) && canResendInvitation(target);
          const canCancel =
            isPendingInvite(employee) && canCancelInvitation(target);
          const canDeactivate =
            employee.status === "ACTIVE" && canDeactivateEmployee(target);
          const canDelete =
            employee.status === "ACTIVE" && canDeleteEmployee(target);
          const hasRowActions =
            canView || canResend || canCancel || canDeactivate || canDelete;

          return (
            <tr
              key={employee.id}
              className="border-b border-propnex-border/60 transition-colors hover:bg-propnex-bg/50"
            >
              <td className="px-4 py-3">
                {canView ? (
                  <Link
                    href={`/employees/${employee.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {employee.name}
                  </Link>
                ) : (
                  <span className="font-medium">{employee.name}</span>
                )}
              </td>
              <td className="px-4 py-3 text-propnex-muted">{employee.email}</td>
              <td className="px-4 py-3 text-propnex-muted">
                {employee.jobTitle ?? "—"}
              </td>
              <td className="px-4 py-3">
                {ROLE_LABELS[employee.role as UserRole] ?? employee.role}
              </td>
              <td className="px-4 py-3 text-propnex-muted">
                {branchLabel(employee)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                    INVITATION_STATUS_STYLES[employee.invitationStatus] ??
                      INVITATION_STATUS_STYLES.PENDING,
                  )}
                >
                  {INVITATION_STATUS_LABELS[employee.invitationStatus] ??
                    employee.invitationStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-propnex-muted">
                {employee.invitationStatus === "ACCEPTED"
                  ? formatDate(employee.lastActiveAt)
                  : "—"}
              </td>
              {showActionsColumn ? (
                <td className="px-4 py-3">
                  {hasRowActions ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Actions"
                            disabled={actionId === employee.id}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        {canView && !isPendingInvite(employee) ? (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/employees/${employee.id}`)
                            }
                          >
                            View profile
                          </DropdownMenuItem>
                        ) : null}
                        {canResend ? (
                          <DropdownMenuItem
                            onClick={() => void handleAction("resend", employee)}
                          >
                            Resend invitation
                          </DropdownMenuItem>
                        ) : null}
                        {canCancel ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => void handleAction("cancel", employee)}
                          >
                            Cancel invitation
                          </DropdownMenuItem>
                        ) : null}
                        {canDeactivate ? (
                          <DropdownMenuItem
                            onClick={() =>
                              void handleAction("deactivate", employee)
                            }
                          >
                            Deactivate
                          </DropdownMenuItem>
                        ) : null}
                        {canDelete ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => void handleAction("delete", employee)}
                          >
                            Delete
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
