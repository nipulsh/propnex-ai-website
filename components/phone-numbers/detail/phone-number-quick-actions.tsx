"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  History,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PhoneNumber } from "@/lib/phone-numbers-data";

type PhoneNumberQuickActionsProps = {
  phoneNumber: PhoneNumber;
  onChangeInboundAgent: () => void;
  onChangeOutboundAgent: () => void;
  onToggleStatus: () => void;
  onTestNumber: () => void;
};

export function PhoneNumberQuickActions({
  phoneNumber,
  onChangeInboundAgent,
  onChangeOutboundAgent,
  onToggleStatus,
  onTestNumber,
}: PhoneNumberQuickActionsProps) {
  const isDisabled = phoneNumber.status === "disabled";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isDisabled}
        onClick={onChangeInboundAgent}
        className="gap-2 border-propnex-border bg-propnex-panel"
      >
        <ArrowDownLeft className="size-3.5" />
        Change Inbound Agent
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isDisabled}
        onClick={onChangeOutboundAgent}
        className="gap-2 border-propnex-border bg-propnex-panel"
      >
        <ArrowUpRight className="size-3.5" />
        Change Outbound Agent
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onToggleStatus}
        className="gap-2 border-propnex-border bg-propnex-panel"
      >
        {isDisabled ? (
          <>
            <CheckCircle2 className="size-3.5" />
            Enable Number
          </>
        ) : (
          <>
            <Ban className="size-3.5" />
            Disable Number
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<a href="#call-history" />}
        className="gap-2 border-propnex-border bg-propnex-panel"
      >
        <History className="size-3.5" />
        View Call Logs
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onTestNumber}
        className="gap-2 border-propnex-border bg-propnex-panel"
      >
        <Phone className="size-3.5" />
        Test Number
      </Button>
    </div>
  );
}
