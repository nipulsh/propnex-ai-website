"use client";

import { Bot } from "lucide-react";

import {
  formatPhoneDisplay,
  type PhoneNumber,
  type PhoneNumberLabel,
} from "@/lib/phone-numbers-data";
import { cn } from "@/lib/utils";

type PhoneNumbersTableProps = {
  numbers: PhoneNumber[];
  startIndex: number;
};

const PURPLE_LABELS: PhoneNumberLabel[] = ["OUTBOUND", "SALES"];

function LabelBadge({ label }: { label: PhoneNumberLabel }) {
  const isPurple = PURPLE_LABELS.includes(label);

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase",
        isPurple
          ? "bg-propnex-accent/10 text-propnex-accent"
          : "bg-cyan-400/10 text-cyan-400",
      )}
    >
      {label}
    </span>
  );
}

function AgentCell({ agentName }: { agentName: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-propnex-accent/15">
        <Bot className="size-3.5 text-propnex-accent" />
      </span>
      <span className="max-w-[140px] truncate text-foreground">{agentName}</span>
    </div>
  );
}

export function PhoneNumbersTable({ numbers, startIndex }: PhoneNumbersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="px-5 py-3 font-medium">#</th>
            <th className="px-5 py-3 font-medium">Number</th>
            <th className="px-5 py-3 font-medium">Label</th>
            <th className="px-5 py-3 font-medium">Assigned Agent</th>
          </tr>
        </thead>
        <tbody>
          {numbers.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-5 py-12 text-center text-propnex-muted"
              >
                No phone numbers match your search or filters.
              </td>
            </tr>
          ) : (
            numbers.map((entry, index) => (
              <tr
                key={entry.id}
                className="border-b border-propnex-border last:border-b-0"
              >
                <td className="px-5 py-4 text-propnex-muted">
                  {startIndex + index + 1}
                </td>
                <td className="px-5 py-4 font-medium text-cyan-400">
                  {formatPhoneDisplay(entry.number)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {entry.labels.map((label) => (
                      <LabelBadge key={label} label={label} />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <AgentCell agentName={entry.agentName} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
