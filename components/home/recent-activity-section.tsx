"use client";

import { useMemo } from "react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { ActivityTimelineItem } from "@/components/home/activity-timeline-item";
import { DashboardEmptyState } from "@/components/home/dashboard-empty-state";
import type { ActivityItem, ActivityType } from "@/lib/home-dashboard-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

function mapEventType(type: string): ActivityType {
  const normalized = type.toLowerCase().replace(/_/g, "-");
  const known: ActivityType[] = [
    "agent-created",
    "campaign-started",
    "call-completed",
    "lead-converted",
    "demo-scheduled",
    "resource-purchased",
  ];
  return known.includes(normalized as ActivityType)
    ? (normalized as ActivityType)
    : "call-completed";
}

export function RecentActivitySection() {
  const events = useHomeDashboardStore((s) => s.events);
  const recentCalls = useHomeDashboardStore((s) => s.recentCalls);

  const activities = useMemo(() => {
    const fromEvents: ActivityItem[] = events.map((event) => ({
      id: event.id,
      type: mapEventType(event.type),
      title: event.title,
      description: event.entityType
        ? `${event.entityType}${event.entityId ? ` · ${event.entityId}` : ""}`
        : "Workspace event",
      timestamp: new Date(event.createdAt).getTime(),
      href: event.entityId ? `/call-logs/${event.entityId}` : undefined,
    }));

    const fromCalls: ActivityItem[] = recentCalls.map((call) => ({
      id: `call-${call.id}`,
      type: "call-completed" as const,
      title: `${call.direction} call ${call.status.toLowerCase()}`,
      description: call.lead
        ? `${call.lead.firstName ?? ""} ${call.lead.lastName ?? ""}`.trim() ||
          "Unknown lead"
        : "No lead attached",
      timestamp: new Date(call.startedAt).getTime(),
      href: `/call-logs/${call.id}`,
    }));

    return [...fromEvents, ...fromCalls]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [events, recentCalls]);

  if (activities.length === 0) {
    return (
      <DashboardSection
        title="Recent Activity"
        description="Latest events across your PropNex workspace."
      >
        <DashboardEmptyState
          title="No recent activity"
          description="Calls and workspace events will appear here."
        />
      </DashboardSection>
    );
  }

  return (
    <DashboardSection
      title="Recent Activity"
      description="Latest events across your PropNex workspace."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-4">
        <div className="relative">
          <div
            className="absolute top-4 bottom-4 left-4 w-px bg-propnex-border"
            aria-hidden
          />
          <div className="space-y-0">
            {activities.map((item) => (
              <ActivityTimelineItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
