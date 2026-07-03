"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { useSideNotification } from "@/components/common/side-notification";
import { EmployeesTable } from "@/components/employees/employees-table";
import { InviteEmployeeDialog } from "@/components/employees/invite-employee-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchEmployeesPage,
  fetchViewerRole,
} from "@/lib/graphql/api";
import type { EmployeeNode, MemberStatus, UserRole } from "@/lib/graphql/queries";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const ROLE_OPTIONS: { value: UserRole | ""; label: string }[] = [
  { value: "", label: "All roles" },
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "SALES", label: "Sales" },
  { value: "SUPPORT", label: "Support" },
  { value: "AGENT", label: "Agent" },
];

const STATUS_OPTIONS: { value: MemberStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INVITED", label: "Invited" },
  { value: "DEACTIVATED", label: "Deactivated" },
];

const EMPLOYEES_COMING_SOON = true;

export function EmployeesPageContent() {
  if (EMPLOYEES_COMING_SOON) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
        <PageHeader
          title="Employees"
          description="Manage your company workforce, roles, and branch access."
        />
        <div className="flex flex-1 items-center justify-center rounded-xl border border-propnex-border bg-propnex-panel py-24">
          <p className="text-lg text-propnex-muted">Coming soon</p>
        </div>
      </div>
    );
  }

  return <EmployeesPageContentInner />;
}

function EmployeesPageContentInner() {
  const { notify } = useSideNotification();

  const [employees, setEmployees] = useState<EmployeeNode[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [canInvite, setCanInvite] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "">("");
  const [pageSize, setPageSize] = useState<number>(25);

  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [after, setAfter] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  const requestRef = useRef(0);

  useEffect(() => {
    fetchViewerRole()
      .then((res) => {
        const perms = res.viewer.permissions ?? [];
        setCanInvite(perms.includes("employees:invite"));
      })
      .catch(() => setCanInvite(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCursorStack([]);
    setAfter(undefined);
  }, [appliedSearch, roleFilter, statusFilter, pageSize]);

  const loadEmployees = useCallback(async () => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    try {
      const filter = {
        search: appliedSearch || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      };
      const res = await fetchEmployeesPage(pageSize, after, filter);
      if (requestId !== requestRef.current) return;
      const conn = res.employees.connection;
      setEmployees(conn.edges.map((e) => e.node));
      setTotalCount(conn.totalCount);
      setHasNextPage(conn.pageInfo.hasNextPage);
      setEndCursor(conn.pageInfo.endCursor);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      notify({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to load employees.",
      });
      setEmployees([]);
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  }, [after, appliedSearch, notify, pageSize, roleFilter, statusFilter]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const pageStart = cursorStack.length * pageSize + (employees.length > 0 ? 1 : 0);
  const pageEnd = cursorStack.length * pageSize + employees.length;

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Employees"
          description="Manage your company workforce, roles, and branch access."
        />
        {canInvite ? (
          <Button onClick={() => setInviteOpen(true)} className="h-9 shrink-0">
            <Plus className="size-4" />
            Invite Employee
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-propnex-border bg-propnex-panel/50 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
          <Input
            placeholder="Search name, email, phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
          className="h-9 rounded-md border border-propnex-border bg-background px-3 text-sm"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MemberStatus | "")}
          className="h-9 rounded-md border border-propnex-border bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="h-9 rounded-md border border-propnex-border bg-background px-3 text-sm"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-propnex-border bg-propnex-panel">
        <EmployeesTable
          employees={employees}
          isLoading={isLoading}
          onChanged={() => void loadEmployees()}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-propnex-muted">
        <span>
          {totalCount === 0
            ? "No employees"
            : `Showing ${pageStart}–${pageEnd} of ${totalCount}`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={cursorStack.length === 0 || isLoading}
            onClick={() => {
              const stack = [...cursorStack];
              stack.pop();
              setCursorStack(stack);
              setAfter(stack[stack.length - 1]);
            }}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || isLoading}
            onClick={() => {
              if (!endCursor) return;
              setCursorStack((s) => [...s, endCursor]);
              setAfter(endCursor);
            }}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <InviteEmployeeDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={() => void loadEmployees()}
      />
    </div>
  );
}
