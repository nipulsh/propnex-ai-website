import { ArrowDownLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import type { PhoneNumber } from "@/lib/phone-numbers-data";

type PhoneNumberRoutingCardProps = {
  phoneNumber: PhoneNumber;
};

function RoutingRow({
  direction,
  agentName,
}: {
  direction: "inbound" | "outbound";
  agentName: string;
}) {
  const isInbound = direction === "inbound";
  const Icon = isInbound ? ArrowDownLeft : ArrowUpRight;
  const label = isInbound ? "Inbound Calls" : "Outbound Calls";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-propnex-border bg-propnex-bg/50 p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 sm:min-w-[180px]">
        <div className="flex size-9 items-center justify-center rounded-lg bg-propnex-accent/10">
          <Icon className="size-4 text-propnex-accent" />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <ArrowRight className="hidden size-4 shrink-0 text-propnex-muted sm:block" />
      <div className="flex-1 rounded-lg border border-propnex-border bg-propnex-panel px-4 py-3">
        <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
          Routed To
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {agentName === "Unassigned" || !agentName ? (
            <span className="text-propnex-muted">No agent assigned</span>
          ) : (
            agentName
          )}
        </p>
      </div>
    </div>
  );
}

export function PhoneNumberRoutingCard({
  phoneNumber,
}: PhoneNumberRoutingCardProps) {
  return (
    <DetailSection
      title="Call Routing Configuration"
      description="Current routing paths for this number. Updates apply without changing the number itself."
    >
      <div className="space-y-3 rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <RoutingRow
          direction="inbound"
          agentName={phoneNumber.inboundAgentName}
        />
        <RoutingRow
          direction="outbound"
          agentName={phoneNumber.outboundAgentName}
        />
      </div>
    </DetailSection>
  );
}
