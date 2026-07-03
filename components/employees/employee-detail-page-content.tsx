"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useSideNotification } from "@/components/common/side-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchBranchesPage,
  fetchEmployeeDetail,
  fetchViewerRole,
  updateEmployee,
} from "@/lib/graphql/api";
import type {
  BranchAccessType,
  EmployeeNode,
  UserRole,
} from "@/lib/graphql/queries";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "SALES", label: "Sales" },
  { value: "SUPPORT", label: "Support" },
  { value: "AGENT", label: "Agent" },
];

const PERMISSION_LABELS: Record<string, string> = {
  "billing:read": "View Billing",
  "billing:write": "Manage Billing",
  "call_logs:read": "View Calls",
  "call_logs:write": "Manage Calls",
  "leads:read": "View Contacts",
  "leads:write": "Manage Contacts",
  "branches:read": "View Branches",
  "branches:write": "Manage Branches",
  "documents:read": "View Documents",
  "documents:write": "Manage Documents",
  "analytics:read": "View Analytics",
  "analytics:write": "Manage Analytics",
  "employees:read": "View Employees",
  "employees:write": "Manage Employees",
  "employees:invite": "Invite Employees",
  "agents:read": "View AI Agents",
  "agents:write": "Manage AI Agents",
  "settings:write": "Manage Settings",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-success/30 bg-success/10 text-success",
  INVITED: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  DEACTIVATED: "border-propnex-border bg-propnex-bg text-propnex-muted",
};

type EmployeeDetailPageContentProps = {
  employeeId: string;
};

export function EmployeeDetailPageContent({
  employeeId,
}: EmployeeDetailPageContentProps) {
  const { notify } = useSideNotification();
  const [employee, setEmployee] = useState<EmployeeNode | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState<UserRole>("AGENT");
  const [branchAccessType, setBranchAccessType] =
    useState<BranchAccessType>("ALL");
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailRes, viewerRes, branchesRes] = await Promise.all([
        fetchEmployeeDetail(employeeId, "AGENT"),
        fetchViewerRole(),
        fetchBranchesPage(100),
      ]);

      const row = detailRes.employees.byId;
      if (!row) {
        setEmployee(null);
        return;
      }

      setEmployee(row);
      setJobTitle(row.jobTitle ?? "");
      setRole(row.role);
      setBranchAccessType(row.branchAccessType);
      setBranchIds(row.assignedBranches.map((b) => b.id));
      setPermissions(
        detailRes.employees.permissionsForRole.length > 0
          ? detailRes.employees.permissionsForRole
          : [],
      );

      const perms = viewerRes.viewer.permissions ?? [];
      setCanWrite(perms.includes("employees:write"));

      setBranches(
        branchesRes.branches.connection.edges.map((e) => ({
          id: e.node.id,
          name: e.node.name,
        })),
      );

      const rolePermsRes = await fetchEmployeeDetail(employeeId, row.role);
      setPermissions(rolePermsRes.employees.permissionsForRole);
    } catch (err) {
      notify({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load employee.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, notify]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!employee) return;
    fetchEmployeeDetail(employeeId, role)
      .then((res) => setPermissions(res.employees.permissionsForRole))
      .catch(() => {});
  }, [employeeId, role, employee]);

  function toggleBranch(id: string) {
    setBranchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    if (!employee) return;
    setIsSaving(true);
    try {
      await updateEmployee(employee.id, {
        jobTitle: jobTitle.trim() || null,
        role,
        branchAccessType,
        branchIds: branchAccessType === "SELECTED" ? branchIds : [],
      });
      notify({ type: "success", message: "Employee updated." });
      void load();
    } catch (err) {
      notify({
        type: "error",
        message: err instanceof Error ? err.message : "Update failed.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-propnex-muted">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <p className="text-propnex-muted">Employee not found.</p>
        <Button render={<Link href="/employees" />} variant="link" className="mt-2 px-0">
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/employees" />}
          variant="ghost"
          size="icon-sm"
          aria-label="Back to employees"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-1 items-center gap-4">
          {employee.imageUrl ? (
            <img
              src={employee.imageUrl}
              alt=""
              className="size-14 rounded-full border border-propnex-border object-cover"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full border border-propnex-border bg-propnex-bg text-lg font-semibold">
              {employee.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold">{employee.name}</h1>
            <p className="text-sm text-propnex-muted">{employee.email}</p>
          </div>
          <span
            className={cn(
              "ml-auto inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
              STATUS_STYLES[employee.status] ?? STATUS_STYLES.ACTIVE,
            )}
          >
            {employee.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-lg border border-propnex-border bg-propnex-panel p-5">
          <h2 className="text-sm font-semibold tracking-wide text-propnex-muted uppercase">
            Basic Information
          </h2>
          <div className="grid gap-3 text-sm">
            <div>
              <p className="text-xs text-propnex-muted">Phone</p>
              <p>{employee.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-propnex-muted">Job title</p>
              {canWrite ? (
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-1 h-9"
                />
              ) : (
                <p>{employee.jobTitle ?? "—"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-propnex-muted">Last active</p>
              <p>
                {employee.lastActiveAt
                  ? new Date(employee.lastActiveAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-propnex-border bg-propnex-panel p-5">
          <h2 className="text-sm font-semibold tracking-wide text-propnex-muted uppercase">
            Role
          </h2>
          {canWrite && employee.role !== "OWNER" ? (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="h-9 w-full rounded-md border border-propnex-border bg-background px-3 text-sm"
            >
              {ROLE_OPTIONS.filter(
                (r) => r.value !== "OWNER" || employee.role === "OWNER",
              ).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm font-medium">{role}</p>
          )}
          <p className="text-xs text-propnex-muted">
            Custom roles coming soon.
          </p>
        </section>

        <section className="space-y-4 rounded-lg border border-propnex-border bg-propnex-panel p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold tracking-wide text-propnex-muted uppercase">
            Branch Access
          </h2>
          {canWrite ? (
            <>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={branchAccessType === "ALL"}
                    onChange={() => setBranchAccessType("ALL")}
                  />
                  All branches
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={branchAccessType === "SELECTED"}
                    onChange={() => setBranchAccessType("SELECTED")}
                  />
                  Selected branches
                </label>
              </div>
              {branchAccessType === "SELECTED" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {branches.map((branch) => (
                    <label
                      key={branch.id}
                      className="flex items-center gap-2 rounded-md border border-propnex-border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={branchIds.includes(branch.id)}
                        onChange={() => toggleBranch(branch.id)}
                      />
                      {branch.name}
                    </label>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm">
              {employee.branchAccessType === "ALL"
                ? "All branches"
                : employee.assignedBranches.map((b) => b.name).join(", ") ||
                  "No branches assigned"}
            </p>
          )}
        </section>

        <section className="space-y-4 rounded-lg border border-propnex-border bg-propnex-panel p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold tracking-wide text-propnex-muted uppercase">
            Permissions
          </h2>
          <p className="text-xs text-propnex-muted">
            Effective permissions inherited from the selected role.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {permissions.map((perm) => (
              <li
                key={perm}
                className="flex items-center gap-2 rounded-md bg-propnex-bg px-3 py-2 text-sm"
              >
                <span className="size-1.5 rounded-full bg-success" />
                {PERMISSION_LABELS[perm] ?? perm}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {canWrite ? (
        <div className="flex justify-end border-t border-propnex-border pt-4">
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
