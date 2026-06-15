"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Server } from "lucide-react";

import { PhoneNumberStatusBadge } from "@/components/phone-numbers/phone-number-status-badge";
import { Button } from "@/components/ui/button";
import {
  formatCreatedDate,
  formatLastActivity,
  formatPhoneDisplay,
  type PhoneNumber,
} from "@/lib/phone-numbers-data";
import { PROVIDER_LABELS } from "@/lib/setup-data";

type PhoneNumberDetailHeaderProps = {
  phoneNumber: PhoneNumber;
};

export function PhoneNumberDetailHeader({
  phoneNumber,
}: PhoneNumberDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/phone-numbers" />}
        className="w-fit gap-2 px-0 text-propnex-muted hover:bg-transparent hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Phone Numbers
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Phone Number
            </p>
            <h1 className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground">
              {formatPhoneDisplay(phoneNumber.number)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PhoneNumberStatusBadge status={phoneNumber.status} />
            <span className="inline-flex items-center gap-1.5 rounded-md border border-propnex-border bg-propnex-panel px-2.5 py-1 text-xs text-propnex-muted">
              <Server className="size-3.5 text-propnex-accent" />
              {PROVIDER_LABELS[phoneNumber.provider]}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-propnex-muted">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 text-propnex-accent" />
              Created {formatCreatedDate(phoneNumber.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-propnex-accent" />
              Last activity {formatLastActivity(phoneNumber.lastActivityAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
