"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { useSideNotification } from "@/components/common/side-notification";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deactivateEmployee,
  deleteEmployee,
  fetchViewerRole,
  resendEmployeeInvite,
} from "@/lib/graphql/api";
import type { EmployeeNode } from "@/lib/graphql/queries";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  AGENT: "Agent",
  SALES: "Sales",
  SUPPORT: "Support",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-success/30 bg-success/10 text-success",
  INVITED: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  DEACTIVATED: "border-propnex-border bg-propnex-bg text-propnex-muted",
  REMOVED: "border-destructive/30 bg-destructive/10 text-destructive",
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
  const [canWrite, setCanWrite] = useState(false);
  const [canInvite, setCanInvite] = useState(false);

  useEffect(() => {
    fetchViewerRole()
      .then((res) => {
        const perms = res.viewer.permissions ?? [];
        setCanWrite(perms.includes("employees:write"));
        setCanInvite(perms.includes("employees:invite"));
      })
      .catch(() => {
        setCanWrite(false);
        setCanInvite(false);
      });
  }, []);

  async function handleAction(
    action: "deactivate" | "delete" | "resend",
    employee: EmployeeNode,
  ) {
    try {
      if (action === "deactivate") {
        await deactivateEmployee(employee.id);
        notify({ type: "success", message: "Employee deactivated." });
      } else if (action === "delete") {
        if (!confirm(`Remove ${employee.name} from the company?`)) return;
        await deleteEmployee(employee.id);
        notify({ type: "success", message: "Employee removed." });
      } else {
        await resendEmployeeInvite(employee.id);
        notify({ type: "success", message: "Invitation resent." });
      }
      onChanged();
    } catch (err) {
      notify({
        type: "error",
        message: err instanceof Error ? err.message : "Action failed.",
      });
    }
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 z-10 bg-propnex-panel">
        <tr className="border-b border-propnex-border text-left text-[0.7rem] tracking-[0.08em] text-propnex-muted uppercase">
          <th className="px-4 py-3 font-medium">Name</th>
          <th className="px-4 py-3 font-medium">Email</th>
          <th className="px-4 py-3 font-medium">Phone</th>
          <th className="px-4 py-3 font-medium">Role</th>
          <th className="px-4 py-3 font-medium">Assigned Branches</th>
          <th className="px-4 py-3 font-medium">Status</th>
          <th className="px-4 py-3 font-medium">Last Active</th>
          {(canWrite || canInvite) && (
            <th className="px-4 py-3 font-medium">Actions</th>
          )}
        </tr>
      </thead>
      <tbody>
        {employees.length === 0 && !isLoading ? (
          <tr>
            <td
              colSpan={8}
              className="px-4 py-12 text-center text-sm text-propnex-muted"
            >
              No employees found. Invite your first team member to get started.
            </td>
          </tr>
        ) : null}
        {employees.map((employee) => (
          <tr
            key={employee.id}
            className="border-b border-propnex-border/60 transition-colors hover:bg-propnex-bg/50"
          >
            <td className="px-4 py-3">
              <Link
                href={`/employees/${employee.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {employee.name}
              </Link>
              {employee.jobTitle ? (
                <p className="text-xs text-propnex-muted">{employee.jobTitle}</p>
              ) : null}
            </td>
            <td className="px-4 py-3 text-propnex-muted">{employee.email}</td>
            <td className="px-4 py-3 text-propnex-muted">
              {employee.phone ?? "—"}
            </td>
            <td className="px-4 py-3">{ROLE_LABELS[employee.role] ?? employee.role}</td>
            <td className="px-4 py-3 text-propnex-muted">{branchLabel(employee)}</td>
            <td className="px-4 py-3">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                  STATUS_STYLES[employee.status] ?? STATUS_STYLES.ACTIVE,
                )}
              >
                {employee.status}
              </span>
            </td>
            <td className="px-4 py-3 text-propnex-muted">
              {formatDate(employee.lastActiveAt)}
            </td>
            {(canWrite || canInvite) && (
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon-sm" aria-label="Actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/employees/${employee.id}`)}
                    >
                      View profile
                    </DropdownMenuItem>
                    {canInvite && employee.status === "INVITED" ? (
                      <DropdownMenuItem
                        onClick={() => void handleAction("resend", employee)}
                      >
                        Resend invite
                      </DropdownMenuItem>
                    ) : null}
                    {canWrite && employee.status === "ACTIVE" ? (
                      <DropdownMenuItem
                        onClick={() => void handleAction("deactivate", employee)}
                      >
                        Deactivate
                      </DropdownMenuItem>
                    ) : null}
                    {canWrite ? (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => void handleAction("delete", employee)}
                      >
                        Delete
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
