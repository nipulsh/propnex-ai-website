"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getCallsForPhoneNumber } from "@/lib/call-logs-data";
import {
  findPhoneNumberInStore,
  getPhoneNumberAnalytics,
  getPhoneNumberMetrics,
} from "@/lib/phone-number-detail-data";
import { usePhoneNumberDetailStore } from "@/stores/phone-number-detail-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

type PhoneNumberDetailPageContentProps = {
  phoneNumberId: string;
};

export function PhoneNumberDetailPageContent({
  phoneNumberId,
}: PhoneNumberDetailPageContentProps) {
  const numbers = usePhoneNumbersStore((s) => s.numbers);
  const setNumberStatus = usePhoneNumbersStore((s) => s.setNumberStatus);
  const isLoading = usePhoneNumberDetailStore((s) => s.isLoading);
  const error = usePhoneNumberDetailStore((s) => s.error);
  const testBanner = usePhoneNumberDetailStore((s) => s.testBanner);
  const hydrate = usePhoneNumberDetailStore((s) => s.hydrate);
  const reset = usePhoneNumberDetailStore((s) => s.reset);
  const setLoading = usePhoneNumberDetailStore((s) => s.setLoading);
  const setError = usePhoneNumberDetailStore((s) => s.setError);
  const setTestBanner = usePhoneNumberDetailStore((s) => s.setTestBanner);

  const [assignDirection, setAssignDirection] = useState<
    "inbound" | "outbound" | null
  >(null);

  const phoneNumber = useMemo(
    () => findPhoneNumberInStore(numbers, phoneNumberId),
    [numbers, phoneNumberId],
  );

  const metrics = useMemo(
    () =>
      phoneNumber ? getPhoneNumberMetrics(phoneNumberId) : null,
    [phoneNumber, phoneNumberId],
  );

  const analytics = useMemo(
    () =>
      phoneNumber ? getPhoneNumberAnalytics(phoneNumberId) : null,
    [phoneNumber, phoneNumberId],
  );

  const hasAnyCalls = useMemo(
    () => getCallsForPhoneNumber(phoneNumberId).length > 0,
    [phoneNumberId],
  );

  useEffect(() => {
    reset();
    setLoading(true);

    const timer = setTimeout(() => {
      const found = findPhoneNumberInStore(
        usePhoneNumbersStore.getState().numbers,
        phoneNumberId,
      );
      if (!found) {
        setError("Phone number not found");
        return;
      }
      hydrate(phoneNumberId);
    }, 300);

    return () => clearTimeout(timer);
  }, [phoneNumberId, hydrate, reset, setError, setLoading]);

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

  if (error || !phoneNumber || !metrics || !analytics) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overscroll-contain p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-propnex-border bg-propnex-panel p-8 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">
            Phone number not found
          </h2>
          <p className="max-w-sm text-sm text-propnex-muted">
            The phone number you are looking for does not exist or may have been
            removed.
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
