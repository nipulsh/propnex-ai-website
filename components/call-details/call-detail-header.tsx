"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Phone,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatCallDate,
  formatCallTime,
  type CallLog,
} from "@/lib/call-logs-data";
import type { CallDetail } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type CallDetailHeaderProps = {
  detail: CallDetail;
};

function StatusBadge({ status }: { status: CallLog["status"] }) {
  const styles: Record<CallLog["status"], string> = {
    completed: "text-success bg-success/10",
    missed: "text-destructive bg-destructive/10",
    voicemail: "text-propnex-accent bg-propnex-accent/10",
    failed: "text-orange-400 bg-orange-400/10",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

export function CallDetailHeader({ detail }: CallDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/call-logs" />}
        className="w-fit gap-2 px-0 text-propnex-muted hover:bg-transparent hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Call Logs
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Call Details
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {detail.leadName}
            </h1>
            <p className="mt-0.5 font-mono text-sm text-propnex-muted">
              {detail.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <Phone className="size-4 text-propnex-accent" />
              {detail.phoneNumber}
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Calendar className="size-4 text-propnex-accent" />
              {formatCallDate(detail.timestamp)} at{" "}
              {formatCallTime(detail.timestamp)}
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <User className="size-4 text-propnex-accent" />
              {detail.agentName}
            </span>
            <StatusBadge status={detail.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={detail.recording.status !== "available"}
          >
            <Download className="size-4" />
            Download Recording
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="size-4" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="gap-2 shadow-[0_0_20px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]"
          >
            <Calendar className="size-4" />
            Schedule Follow-up
          </Button>
        </div>
      </div>
    </div>
  );
}
