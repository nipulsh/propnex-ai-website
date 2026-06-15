"use client";

import { useMemo } from "react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { ActivityTimelineItem } from "@/components/home/activity-timeline-item";
import { getRecentActivity } from "@/lib/home-dashboard-data";

export function RecentActivitySection() {
  const activities = useMemo(() => getRecentActivity(), []);

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
