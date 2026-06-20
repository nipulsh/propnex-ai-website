"use client";

import { useMemo } from "react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { NotificationItem } from "@/components/home/notification-item";
import { DashboardEmptyState } from "@/components/home/dashboard-empty-state";
import type { DashboardAlert } from "@/lib/home-dashboard-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";
import { useUsageStore } from "@/stores/usage-store";

export function NotificationsSection() {
  const dismissedAlertIds = useHomeDashboardStore((s) => s.dismissedAlertIds);
  const dismissAlert = useHomeDashboardStore((s) => s.dismissAlert);
  const notifications = useHomeDashboardStore((s) => s.notifications);
  const remainingCredits = useUsageStore((s) => s.remainingCredits);
  const totalCredits = useUsageStore((s) => s.totalCredits);

  const alerts = useMemo(() => {
    const items: DashboardAlert[] = notifications.map((n) => ({
      id: n.id,
      severity:
        n.type.toLowerCase().includes("critical") ||
        n.type.toLowerCase().includes("error")
          ? "critical"
          : n.type.toLowerCase().includes("warning")
            ? "warning"
            : "info",
      title: n.title,
      message: n.body,
      href: "/dashboard",
    }));

    const creditPercent =
      totalCredits > 0 ? (remainingCredits / totalCredits) * 100 : 100;
    if (creditPercent < 20 && !items.some((a) => a.id === "low-credits")) {
      items.unshift({
        id: "low-credits",
        severity: creditPercent < 10 ? "critical" : "warning",
        title: "Credits running low",
        message: `${remainingCredits.toLocaleString()} credits remaining (${Math.round(creditPercent)}%).`,
        href: "/billing",
      });
    }

    return items.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [
    notifications,
    remainingCredits,
    totalCredits,
    dismissedAlertIds,
  ]);

  return (
    <DashboardSection
      title="Notifications & Alerts"
      description="Important updates requiring your attention."
    >
      {alerts.length === 0 ? (
        <DashboardEmptyState
          title="All caught up"
          description="No notifications or alerts right now."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <NotificationItem
              key={alert.id}
              alert={alert}
              onDismiss={() => dismissAlert(alert.id)}
            />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
