"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { useSideNotification } from "@/components/common/side-notification";
import { Can } from "@/components/permissions/can";
import { BranchesBulkBar } from "@/components/branches/branches-bulk-bar";
import { BranchesTable } from "@/components/branches/branches-table";
import { CreateBranchDialog } from "@/components/branches/create-branch-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchBranchesPage } from "@/lib/graphql/api";
import type { BranchNode } from "@/lib/graphql/queries";
import { PERMISSIONS } from "@/lib/permissions";
import {
  BRANCHES_PAGE_SIZE_OPTIONS,
  useBranchesStore,
} from "@/stores/branches-store";

export function BranchesPageContent() {
  const { notify } = useSideNotification();
  const clearSelection = useBranchesStore((s) => s.clearSelection);

  const [branches, setBranches] = useState<BranchNode[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [aiFilter, setAiFilter] = useState("");
  const [pageSize, setPageSize] = useState<number>(25);

  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [after, setAfter] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  const requestRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadBranches = useCallback(async () => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    try {
      const filter = {
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
        aiEnabled:
          aiFilter === "" ? undefined : aiFilter === "true" ? true : false,
      };
      const res = await fetchBranchesPage(pageSize, after, filter);
      if (requestId !== requestRef.current) return;
      const conn = res.branches.connection;
      setBranches(conn.edges.map((e) => e.node));
      setTotalCount(conn.totalCount);
      setHasNextPage(conn.pageInfo.hasNextPage);
      setEndCursor(conn.pageInfo.endCursor);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      notify({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load branches.",
      });
      setBranches([]);
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  }, [appliedSearch, statusFilter, aiFilter, pageSize, after, notify]);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  function resetPagination() {
    setCursorStack([]);
    setAfter(undefined);
  }

  function handleFilterChange(fn: () => void) {
    resetPagination();
    clearSelection();
    fn();
  }

  function goNext() {
    if (!hasNextPage || !endCursor) return;
    clearSelection();
    setCursorStack((prev) => [...prev, after ?? ""]);
    setAfter(endCursor);
  }

  function goPrev() {
    clearSelection();
    setCursorStack((prev) => {
      const next = [...prev];
      const previous = next.pop();
      setAfter(previous || undefined);
      return next;
    });
  }

  const currentPage = cursorStack.length + 1;
  const showingFrom = branches.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = (currentPage - 1) * pageSize + branches.length;

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Branches"
          description="Manage every business unit across your company from one place."
        />
        <Can permission={PERMISSIONS.BRANCHES_WRITE}>
          <Button onClick={() => setCreateOpen(true)} className="h-9 shrink-0">
            <Plus className="size-4" />
            New Branch
          </Button>
        </Can>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-propnex-muted" />
          <Input
            value={searchInput}
            onChange={(e) =>
              handleFilterChange(() => setSearchInput(e.target.value))
            }
            placeholder="Search by name, address, phone, or email…"
            className="h-9 border-propnex-border bg-propnex-panel pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            handleFilterChange(() => setStatusFilter(e.target.value))
          }
          className="h-9 rounded-lg border border-propnex-border bg-propnex-panel px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          value={aiFilter}
          onChange={(e) => handleFilterChange(() => setAiFilter(e.target.value))}
          className="h-9 rounded-lg border border-propnex-border bg-propnex-panel px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
        >
          <option value="">AI: all</option>
          <option value="true">AI enabled</option>
          <option value="false">AI disabled</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) =>
            handleFilterChange(() => setPageSize(Number(e.target.value)))
          }
          className="h-9 rounded-lg border border-propnex-border bg-propnex-panel px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
        >
          {BRANCHES_PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <BranchesBulkBar
        onDone={() => void loadBranches()}
        onNotify={(message, type) => notify({ type, message })}
      />

      <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
        <div className="propnex-scrollbar overflow-x-auto">
          <BranchesTable branches={branches} isLoading={isLoading} />
        </div>
        <div className="flex items-center justify-between border-t border-propnex-border px-4 py-3">
          <p className="text-sm text-propnex-muted">
            {isLoading
              ? "Loading…"
              : `Showing ${showingFrom}–${showingTo} of ${totalCount}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={goPrev}
              className="h-8 border-propnex-border"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-propnex-muted">Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage || isLoading}
              onClick={goNext}
              className="h-8 border-propnex-border"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <CreateBranchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void loadBranches()}
        onNotify={(message, type) => notify({ type, message })}
      />
    </div>
  );
}
