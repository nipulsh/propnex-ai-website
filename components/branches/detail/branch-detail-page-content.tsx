"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, BotOff } from "lucide-react";

import { useSideNotification } from "@/components/common/side-notification";
import { BranchOverviewTab } from "@/components/branches/detail/branch-overview-tab";
import { BranchAiTab } from "@/components/branches/detail/branch-ai-tab";
import { BranchRelatedTab } from "@/components/branches/detail/branch-related-tab";
import { BranchActivityTab } from "@/components/branches/detail/branch-activity-tab";
import { BranchStats } from "@/components/branches/detail/branch-stats";
import { fetchBranchDetail } from "@/lib/graphql/api";
import type { BranchActivityNode, BranchNode } from "@/lib/graphql/queries";
import { cn } from "@/lib/utils";

type BranchDetailPageContentProps = {
  branchId: string;
};

type TabKey =
  | "overview"
  | "ai"
  | "contacts"
  | "call-logs"
  | "documents"
  | "activity";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "ai", label: "AI Agent" },
  { key: "contacts", label: "Contacts" },
  { key: "call-logs", label: "Call Logs" },
  { key: "documents", label: "Documents" },
  { key: "activity", label: "Activity" },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-success/30 bg-success/10 text-success",
  INACTIVE: "border-propnex-border bg-propnex-bg text-propnex-muted",
  ARCHIVED: "border-destructive/30 bg-destructive/10 text-destructive",
};

function TabLoadingPanel() {
  return (
    <div className="rounded-xl border border-propnex-border bg-propnex-panel p-8 text-center text-sm text-propnex-muted">
      Loading…
    </div>
  );
}

export function BranchDetailPageContent({
  branchId,
}: BranchDetailPageContentProps) {
  const { notify } = useSideNotification();
  const [branch, setBranch] = useState<BranchNode | null>(null);
  const [activities, setActivities] = useState<BranchActivityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchBranchDetail(branchId);
      if (!res.branches.byId) {
        setNotFound(true);
        return;
      }
      setBranch(res.branches.byId);
      setActivities(res.branches.activities);
    } catch (err) {
      notify({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load branch.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [branchId, notify]);

  useEffect(() => {
    void load();
  }, [load]);

  if (notFound) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-propnex-muted">Branch not found.</p>
      </div>
    );
  }

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {branch?.name ?? (isLoading ? "Loading…" : "Branch")}
          </h1>
          {branch ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-medium",
                STATUS_STYLES[branch.status] ?? STATUS_STYLES.INACTIVE,
              )}
            >
              {branch.status}
            </span>
          ) : null}
        </div>
        {branch ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-propnex-muted">
            {branch.aiEnabled ? (
              <>
                <Bot className="size-4 text-success" /> AI Enabled
              </>
            ) : (
              <>
                <BotOff className="size-4" /> AI Disabled
              </>
            )}
          </span>
        ) : null}
      </div>

      {branch ? (
        <div className="mt-5">
          <BranchStats
            branch={branch}
            onTabSelect={(tab) => setActiveTab(tab)}
          />
        </div>
      ) : isLoading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-propnex-border bg-propnex-panel"
            />
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex gap-1 border-b border-propnex-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "text-foreground"
                : "text-propnex-muted hover:text-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.key ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {activeTab === "overview" ? (
          branch ? (
            <BranchOverviewTab
              branch={branch}
              onSaved={() => void load()}
              onNotify={(message, type) => notify({ type, message })}
            />
          ) : isLoading ? (
            <TabLoadingPanel />
          ) : null
        ) : null}
        {activeTab === "ai" ? (
          branch ? (
            <BranchAiTab
              branch={branch}
              onSaved={() => void load()}
              onNotify={(message, type) => notify({ type, message })}
            />
          ) : isLoading ? (
            <TabLoadingPanel />
          ) : null
        ) : null}
        {activeTab === "contacts" ? (
          <BranchRelatedTab branchId={branchId} kind="contacts" />
        ) : null}
        {activeTab === "call-logs" ? (
          <BranchRelatedTab branchId={branchId} kind="call-logs" />
        ) : null}
        {activeTab === "documents" ? (
          <BranchRelatedTab branchId={branchId} kind="documents" />
        ) : null}
        {activeTab === "activity" ? (
          <BranchActivityTab activities={activities} isLoading={isLoading} />
        ) : null}
      </div>
    </div>
  );
}
