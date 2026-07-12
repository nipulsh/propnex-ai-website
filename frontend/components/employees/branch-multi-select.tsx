"use client";

import { Search, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type BranchOption = {
  id: string;
  name: string;
};

type BranchMultiSelectProps = {
  branches: BranchOption[];
  value: string[];
  onChange: (branchIds: string[]) => void;
  disabled?: boolean;
  error?: string;
};

export function BranchMultiSelect({
  branches,
  value,
  onChange,
  disabled = false,
  error,
}: BranchMultiSelectProps) {
  const [search, setSearch] = useState("");

  const selectedBranches = useMemo(
    () => branches.filter((branch) => value.includes(branch.id)),
    [branches, value],
  );

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return branches;
    return branches.filter((branch) =>
      branch.name.toLowerCase().includes(query),
    );
  }, [branches, search]);

  function toggleBranch(id: string) {
    if (disabled) return;
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  }

  function removeBranch(id: string) {
    if (disabled) return;
    onChange(value.filter((item) => item !== id));
  }

  return (
    <div className="space-y-2">
      {selectedBranches.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedBranches.map((branch) => (
            <span
              key={branch.id}
              className="inline-flex items-center gap-1 rounded-full border border-propnex-border bg-propnex-bg px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {branch.name}
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => removeBranch(branch.id)}
                  className="rounded-full p-0.5 text-propnex-muted hover:bg-propnex-panel hover:text-foreground"
                  aria-label={`Remove ${branch.name}`}
                >
                  <XIcon className="size-3" />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search branches…"
          disabled={disabled}
          className="h-10 border-propnex-border bg-propnex-bg pl-9 text-foreground placeholder:text-propnex-muted"
        />
      </div>

      <div
        className={cn(
          "max-h-40 space-y-1 overflow-y-auto rounded-md border border-propnex-border p-2",
          disabled && "opacity-60",
        )}
      >
        {filteredBranches.length === 0 ? (
          <p className="px-2 py-3 text-sm text-propnex-muted">
            {branches.length === 0
              ? "No branches available."
              : "No branches match your search."}
          </p>
        ) : (
          filteredBranches.map((branch) => {
            const checked = value.includes(branch.id);
            return (
              <button
                key={branch.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleBranch(branch.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  checked
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground hover:bg-propnex-bg",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-propnex-border bg-background",
                  )}
                >
                  {checked ? "✓" : null}
                </span>
                {branch.name}
              </button>
            );
          })
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
