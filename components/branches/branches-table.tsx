"use client";

import Link from "next/link";
import { Bot, BotOff, Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BranchNode } from "@/lib/graphql/queries";
import { useBranchesStore } from "@/stores/branches-store";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-success/30 bg-success/10 text-success",
  INACTIVE: "border-propnex-border bg-propnex-bg text-propnex-muted",
  ARCHIVED: "border-destructive/30 bg-destructive/10 text-destructive",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type BranchesTableProps = {
  branches: BranchNode[];
  isLoading: boolean;
};

export function BranchesTable({ branches, isLoading }: BranchesTableProps) {
  const selectedIds = useBranchesStore((s) => s.selectedIds);
  const toggleSelect = useBranchesStore((s) => s.toggleSelect);
  const selectAll = useBranchesStore((s) => s.selectAll);

  const pageIds = branches.map((b) => b.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const someOnPageSelected = pageIds.some((id) => selectedIds.includes(id));

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 z-10 bg-propnex-panel">
        <tr className="border-b border-propnex-border text-left text-[0.7rem] tracking-[0.08em] text-propnex-muted uppercase">
          <th className="w-10 px-4 py-3">
            <input
              type="checkbox"
              aria-label="Select all branches on this page"
              className="size-4 cursor-pointer accent-primary"
              checked={allOnPageSelected}
              ref={(el) => {
                if (el)
                  el.indeterminate = someOnPageSelected && !allOnPageSelected;
              }}
              onChange={() => selectAll(pageIds)}
            />
          </th>
          <th className="px-4 py-3 font-medium">Branch Name</th>
          <th className="px-4 py-3 font-medium">Status</th>
          <th className="px-4 py-3 font-medium">Address</th>
          <th className="px-4 py-3 font-medium">Phone</th>
          <th className="px-4 py-3 font-medium">Last Activity</th>
          <th className="px-4 py-3 text-center font-medium">AI Enabled</th>
          <th className="px-4 py-3 font-medium whitespace-nowrap">Details</th>
        </tr>
      </thead>
      <tbody>
        {branches.length === 0 && !isLoading ? (
          <tr>
            <td
              colSpan={8}
              className="px-4 py-12 text-center text-sm text-propnex-muted"
            >
              No branches found. Create your first branch to get started.
            </td>
          </tr>
        ) : null}
        {branches.map((branch) => {
          const isSelected = selectedIds.includes(branch.id);
          return (
            <tr
              key={branch.id}
              className={cn(
                "border-b border-propnex-border/60 transition-colors hover:bg-propnex-bg/50",
                isSelected && "bg-primary/5",
              )}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label={`Select ${branch.name}`}
                  className="size-4 cursor-pointer accent-primary"
                  checked={isSelected}
                  onChange={() => toggleSelect(branch.id)}
                />
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/branches/${branch.id}`}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {branch.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-medium",
                    STATUS_STYLES[branch.status] ?? STATUS_STYLES.INACTIVE,
                  )}
                >
                  {branch.status}
                </span>
              </td>
              <td className="max-w-[16rem] truncate px-4 py-3 text-propnex-muted">
                {branch.address ?? "—"}
              </td>
              <td className="px-4 py-3 text-propnex-muted">
                {branch.phone ?? "—"}
              </td>
              <td className="px-4 py-3 text-propnex-muted">
                {formatDate(branch.lastActivityAt)}
              </td>
              <td className="px-4 py-3 text-center">
                {branch.aiEnabled ? (
                  <Bot
                    className="mx-auto size-4 text-success"
                    aria-label="AI enabled"
                  />
                ) : (
                  <BotOff
                    className="mx-auto size-4 text-propnex-muted"
                    aria-label="AI disabled"
                  />
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link
                  href={`/branches/${branch.id}`}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-propnex-border bg-propnex-panel px-2.5 text-xs font-medium text-propnex-accent transition-colors hover:bg-propnex-accent/10"
                >
                  <Eye className="size-3.5" />
                  Details
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
