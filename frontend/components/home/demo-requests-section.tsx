"use client";

import { useMemo, useState } from "react";
import { Calendar, Clock } from "lucide-react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { DashboardEmptyState } from "@/components/home/dashboard-empty-state";
import { cn } from "@/lib/utils";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

type DemoTab = "upcoming" | "completed" | "pending";

const TABS: { value: DemoTab; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
];

function mapSchedulerStatus(status: string): DemoTab {
  const lower = status.toLowerCase();
  if (lower === "completed" || lower === "done") return "completed";
  if (lower === "pending" || lower === "scheduled") return "pending";
  return "upcoming";
}

export function DemoRequestsSection() {
  const schedulerEvents = useHomeDashboardStore((s) => s.schedulerEvents);
  const [activeTab, setActiveTab] = useState<DemoTab>("upcoming");

  const demos = useMemo(
    () =>
      schedulerEvents.map((event) => ({
        id: event.id,
        title: event.title,
        type: event.type,
        status: mapSchedulerStatus(event.status),
        startAt: new Date(event.startAt),
      })),
    [schedulerEvents],
  );

  const filtered = demos.filter((d) => d.status === activeTab);
  const nextDemo = demos
    .filter((d) => d.startAt.getTime() > Date.now())
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0];

  const hoursUntilNext = nextDemo
    ? Math.round((nextDemo.startAt.getTime() - Date.now()) / 3600000)
    : null;

  if (demos.length === 0) {
    return (
      <DashboardSection
        id="demo-requests"
        title="Scheduled Events"
        description="Upcoming demonstrations and scheduled workspace events."
      >
        <DashboardEmptyState
          title="No scheduled events"
          description="Scheduler events will appear here when demos or calls are booked."
        />
      </DashboardSection>
    );
  }

  return (
    <DashboardSection
      id="demo-requests"
      title="Scheduled Events"
      description="Upcoming demonstrations and scheduled workspace events."
    >
      {nextDemo && hoursUntilNext !== null && hoursUntilNext <= 48 ? (
        <div className="rounded-lg border border-propnex-accent/30 bg-propnex-accent/10 px-4 py-3 text-sm text-propnex-accent">
          <strong>Upcoming:</strong> {nextDemo.title}
          {hoursUntilNext <= 24 ? " (within 24 hours)" : ` (in ${hoursUntilNext}h)`}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count = demos.filter((d) => d.status === tab.value).length;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "border-propnex-accent bg-propnex-accent/10 text-propnex-accent"
                  : "border-propnex-border text-propnex-muted hover:text-foreground",
              )}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-propnex-muted">
            No {activeTab} events in this category.
          </p>
        ) : (
          filtered.map((demo) => (
            <div
              key={demo.id}
              className="flex flex-col gap-2 border-b border-propnex-border px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{demo.title}</p>
                <p className="text-sm text-propnex-muted capitalize">{demo.type}</p>
              </div>
              <div className="flex gap-3 text-xs text-propnex-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {demo.startAt.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {demo.startAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardSection>
  );
}
