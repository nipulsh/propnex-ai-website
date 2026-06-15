"use client";

import { ChevronDown } from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import type { PhoneNumber } from "@/lib/phone-numbers-data";
import { useAgentsStore } from "@/stores/agents-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

type PhoneNumberAgentAssignmentProps = {
  phoneNumber: PhoneNumber;
};

export function PhoneNumberAgentAssignment({
  phoneNumber,
}: PhoneNumberAgentAssignmentProps) {
  const agents = useAgentsStore((s) => s.agents);
  const setInboundAgent = usePhoneNumbersStore((s) => s.setInboundAgent);
  const setOutboundAgent = usePhoneNumbersStore((s) => s.setOutboundAgent);

  function handleInboundChange(agentId: string) {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    setInboundAgent(phoneNumber.id, agent.id, agent.name);
  }

  function handleOutboundChange(agentId: string) {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    setOutboundAgent(phoneNumber.id, agent.id, agent.name);
  }

  return (
    <DetailSection
      title="Agent Assignment"
      description="Configure separate AI agents for inbound and outbound call routing."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <label
            htmlFor="inbound-agent-select"
            className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
          >
            Inbound Agent
          </label>
          <div className="relative">
            <select
              id="inbound-agent-select"
              value={phoneNumber.inboundAgentId || agents[0]?.id}
              onChange={(event) => handleInboundChange(event.target.value)}
              disabled={phoneNumber.status === "disabled"}
              className="h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg py-2 pr-10 pl-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30 disabled:opacity-50"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
          </div>
          <p className="text-xs text-propnex-muted">
            Handles incoming calls to this number.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <label
            htmlFor="outbound-agent-select"
            className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
          >
            Outbound Agent
          </label>
          <div className="relative">
            <select
              id="outbound-agent-select"
              value={phoneNumber.outboundAgentId || agents[0]?.id}
              onChange={(event) => handleOutboundChange(event.target.value)}
              disabled={phoneNumber.status === "disabled"}
              className="h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg py-2 pr-10 pl-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30 disabled:opacity-50"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
          </div>
          <p className="text-xs text-propnex-muted">
            Handles outbound campaigns from this number.
          </p>
        </div>
      </div>
    </DetailSection>
  );
}
