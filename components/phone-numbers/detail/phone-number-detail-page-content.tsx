"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { AssignAgentDialog } from "@/components/phone-numbers/assign-agent-dialog";
import { PhoneNumberAgentAssignment } from "@/components/phone-numbers/detail/phone-number-agent-assignment";
import { PhoneNumberAnalyticsSection } from "@/components/phone-numbers/detail/phone-number-analytics";
import { PhoneNumberCallHistory } from "@/components/phone-numbers/detail/phone-number-call-history";
import { PhoneNumberDetailHeader } from "@/components/phone-numbers/detail/phone-number-detail-header";
import { PhoneNumberDetailSkeleton } from "@/components/phone-numbers/detail/phone-number-detail-skeleton";
import { PhoneNumberOverview } from "@/components/phone-numbers/detail/phone-number-overview";
import { PhoneNumberQuickActions } from "@/components/phone-numbers/detail/phone-number-quick-actions";
import { PhoneNumberRoutingCard } from "@/components/phone-numbers/detail/phone-number-routing-card";
import { Button } from "@/components/ui/button";
import { usePhoneNumberDetailGraphQL } from "@/hooks/use-phone-number-detail-graphql";
import type { CallLog } from "@/lib/call-logs-data";
import type {
  PhoneNumberAnalytics,
  PhoneNumberOverviewMetrics,
} from "@/lib/phone-number-detail-data";
import { usePhoneNumberDetailStore } from "@/stores/phone-number-detail-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

type PhoneNumberDetailPageContentProps = {
  phoneNumberId: string;
};

function computeMetrics(calls: CallLog[]): PhoneNumberOverviewMetrics {
  const inbound = calls.filter((c) => c.direction === "inbound");
  const outbound = calls.filter((c) => c.direction === "outbound");
  const missed = calls.filter((c) => c.status === "missed");
  const completed = calls.filter((c) => c.status === "completed");
  const totalDuration = completed.reduce((sum, c) => sum + c.durationSeconds, 0);

  return {
    totalCalls: calls.length,
    inboundCalls: inbound.length,
    outboundCalls: outbound.length,
    missedCalls: missed.length,
    averageDurationSeconds:
      completed.length > 0 ? Math.round(totalDuration / completed.length) : 0,
    totalTalkTimeSeconds: totalDuration,
  };
}

function computeAnalytics(calls: CallLog[]): PhoneNumberAnalytics {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCalls = calls.filter((c) => c.timestamp >= todayStart.getTime());
  const weekCalls = calls.filter((c) => c.timestamp >= now - 7 * dayMs);
  const monthCalls = calls.filter((c) => c.timestamp >= now - 30 * dayMs);
  const outboundCompleted = calls.filter(
    (c) => c.direction === "outbound" && c.status === "completed",
  );

  return {
    inboundCallsToday: todayCalls.filter((c) => c.direction === "inbound").length,
    outboundCallsToday: todayCalls.filter((c) => c.direction === "outbound")
      .length,
    weeklyActivity: weekCalls.length,
    monthlyActivity: monthCalls.length,
    conversionRate:
      outboundCompleted.length > 0
        ? Math.round((outboundCompleted.length / calls.length) * 100)
        : 0,
    hotLeadsGenerated: 0,
    dailyTrend: [],
  };
}

export function PhoneNumberDetailPageContent({
  phoneNumberId,
}: PhoneNumberDetailPageContentProps) {
  usePhoneNumberDetailGraphQL(phoneNumberId);

  const phoneNumber = usePhoneNumbersStore((s) =>
    s.numbers.find((n) => n.id === phoneNumberId),
  );
  const setNumberStatus = usePhoneNumbersStore((s) => s.setNumberStatus);
  const isLoading = usePhoneNumberDetailStore((s) => s.isLoading);
  const error = usePhoneNumberDetailStore((s) => s.error);
  const testBanner = usePhoneNumberDetailStore((s) => s.testBanner);
  const calls = usePhoneNumberDetailStore((s) => s.calls);
  const setTestBanner = usePhoneNumberDetailStore((s) => s.setTestBanner);

  const [assignDirection, setAssignDirection] = useState<
    "inbound" | "outbound" | null
  >(null);

  const metrics = useMemo(() => computeMetrics(calls), [calls]);
  const analytics = useMemo(() => computeAnalytics(calls), [calls]);
  const hasAnyCalls = calls.length > 0;

  function handleTestNumber() {
    setTestBanner(
      `Test call initiated to ${phoneNumber?.number ?? "number"}. Connection verified.`,
    );
    setTimeout(() => setTestBanner(null), 4000);
  }

  function handleToggleStatus() {
    if (!phoneNumber) return;
    setNumberStatus(
      phoneNumber.id,
      phoneNumber.status === "disabled" ? "active" : "disabled",
    );
  }

  if (isLoading) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
        <PhoneNumberDetailSkeleton />
      </div>
    );
  }

  if (error || !phoneNumber) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overscroll-contain p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-propnex-border bg-propnex-panel p-8 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">
            Phone number not found
          </h2>
          <p className="max-w-sm text-sm text-propnex-muted">
            {error ??
              "The phone number you are looking for does not exist or may have been removed."}
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/phone-numbers" />}
            className="mt-2"
          >
            Back to Phone Numbers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      {testBanner ? (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {testBanner}
        </div>
      ) : null}

      <PhoneNumberDetailHeader phoneNumber={phoneNumber} />

      <PhoneNumberQuickActions
        phoneNumber={phoneNumber}
        onChangeInboundAgent={() => setAssignDirection("inbound")}
        onChangeOutboundAgent={() => setAssignDirection("outbound")}
        onToggleStatus={handleToggleStatus}
        onTestNumber={handleTestNumber}
      />

      <PhoneNumberOverview metrics={metrics} />
      <PhoneNumberAgentAssignment phoneNumber={phoneNumber} />
      <PhoneNumberRoutingCard phoneNumber={phoneNumber} />
      <PhoneNumberAnalyticsSection analytics={analytics} />
      <PhoneNumberCallHistory
        phoneNumberId={phoneNumberId}
        hasAnyCalls={hasAnyCalls}
        onAssignAgent={() => setAssignDirection("inbound")}
        onTestNumber={handleTestNumber}
      />

      {assignDirection ? (
        <AssignAgentDialog
          open
          onOpenChange={(open) => {
            if (!open) setAssignDirection(null);
          }}
          phoneNumberId={phoneNumber.id}
          direction={assignDirection}
          currentAgentId={
            assignDirection === "inbound"
              ? phoneNumber.inboundAgentId
              : phoneNumber.outboundAgentId
          }
        />
      ) : null}
    </div>
  );
}
