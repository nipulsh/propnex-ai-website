"use client";

import { useMemo } from "react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { NotificationItem } from "@/components/home/notification-item";
import { DashboardEmptyState } from "@/components/home/dashboard-empty-state";
import { getDashboardAlerts } from "@/lib/home-dashboard-data";
import { INITIAL_RESOURCE_USAGE } from "@/lib/billing-resources-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { useSetupStore } from "@/stores/setup-store";
import { useUsageStore } from "@/stores/usage-store";

export function NotificationsSection() {
  const dismissedAlertIds = useHomeDashboardStore((s) => s.dismissedAlertIds);
  const dismissAlert = useHomeDashboardStore((s) => s.dismissAlert);

  const channelUsage = useSetupStore((s) => s.channelUsage);
  const phoneNumbers = usePhoneNumbersStore((s) => s.numbers);
  const remainingCredits = useUsageStore((s) => s.remainingCredits);
  const totalCredits = useUsageStore((s) => s.totalCredits);

  const alerts = useMemo(() => {
    const channelsAssigned =
      channelUsage.totalAssigned || INITIAL_RESOURCE_USAGE.channelsAssigned;
    const channelsActive =
      channelUsage.active || INITIAL_RESOURCE_USAGE.channelsActive;
    const virtualNumbers =
      phoneNumbers.length || INITIAL_RESOURCE_USAGE.virtualNumbers;

    return getDashboardAlerts({
      remainingCredits,
      totalCredits,
      channelsActive,
      channelsAssigned,
      virtualNumbers,
      virtualNumberCapacity: Math.max(virtualNumbers, 10),
    }).filter((a) => !dismissedAlertIds.includes(a.id));
  }, [
    channelUsage,
    phoneNumbers.length,
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
          title="All clear"
          description="No active alerts. Your AI calling operation is running smoothly."
        />
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <NotificationItem
              key={alert.id}
              alert={alert}
              onDismiss={dismissAlert}
            />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
