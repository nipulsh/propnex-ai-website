"use client";

import { Calendar, CheckCircle2, Headset, ArrowDownLeft } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import {
  CALL_HISTORY_DATE_RANGE_OPTIONS,
  DIRECTION_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/call-logs-data";
import { useAgentsStore } from "@/stores/agents-store";
import { usePhoneNumberDetailStore } from "@/stores/phone-number-detail-store";

export function PhoneNumberCallHistoryFilters() {
  const agents = useAgentsStore((s) => s.agents);
  const agentOptions = [
    { value: "all", label: "All Agents" },
    ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
  ];
  const historyDirection = usePhoneNumberDetailStore(
    (s) => s.historyDirection,
  );
  const historyStatus = usePhoneNumberDetailStore((s) => s.historyStatus);
  const historyDateRange = usePhoneNumberDetailStore((s) => s.historyDateRange);
  const historyCustomFrom = usePhoneNumberDetailStore(
    (s) => s.historyCustomFrom,
  );
  const historyCustomTo = usePhoneNumberDetailStore((s) => s.historyCustomTo);
  const historyAgentId = usePhoneNumberDetailStore((s) => s.historyAgentId);
  const setHistoryDirection = usePhoneNumberDetailStore(
    (s) => s.setHistoryDirection,
  );
  const setHistoryStatus = usePhoneNumberDetailStore((s) => s.setHistoryStatus);
  const setHistoryDateRange = usePhoneNumberDetailStore(
    (s) => s.setHistoryDateRange,
  );
  const setHistoryCustomFrom = usePhoneNumberDetailStore(
    (s) => s.setHistoryCustomFrom,
  );
  const setHistoryCustomTo = usePhoneNumberDetailStore(
    (s) => s.setHistoryCustomTo,
  );
  const setHistoryAgentId = usePhoneNumberDetailStore(
    (s) => s.setHistoryAgentId,
  );

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelectField
          id="phone-history-direction"
          label="Direction"
          icon={ArrowDownLeft}
          value={historyDirection}
          onChange={(value) =>
            setHistoryDirection(value as typeof historyDirection)
          }
          options={DIRECTION_OPTIONS}
        />

        <FilterSelectField
          id="phone-history-status"
          label="Status"
          icon={CheckCircle2}
          value={historyStatus}
          onChange={(value) => setHistoryStatus(value as typeof historyStatus)}
          options={STATUS_OPTIONS}
        />

        <FilterSelectField
          id="phone-history-date-range"
          label="Date Range"
          icon={Calendar}
          value={historyDateRange}
          onChange={(value) =>
            setHistoryDateRange(value as typeof historyDateRange)
          }
          options={CALL_HISTORY_DATE_RANGE_OPTIONS}
        />

        <FilterSelectField
          id="phone-history-agent"
          label="Agent"
          icon={Headset}
          value={historyAgentId}
          onChange={setHistoryAgentId}
          options={agentOptions}
        />
      </div>

      {historyDateRange === "custom" ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="phone-history-from"
              className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
            >
              From
            </label>
            <input
              id="phone-history-from"
              type="date"
              value={historyCustomFrom}
              onChange={(event) => setHistoryCustomFrom(event.target.value)}
              className="h-11 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="phone-history-to"
              className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
            >
              To
            </label>
            <input
              id="phone-history-to"
              type="date"
              value={historyCustomTo}
              onChange={(event) => setHistoryCustomTo(event.target.value)}
              className="h-11 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
