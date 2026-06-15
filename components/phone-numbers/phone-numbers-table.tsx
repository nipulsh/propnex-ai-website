"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PhoneNumberActionsMenu } from "@/components/phone-numbers/phone-number-actions-menu";
import { PhoneNumberStatusBadge } from "@/components/phone-numbers/phone-number-status-badge";
import {
  formatLastActivity,
  formatPhoneDisplay,
  type PhoneNumber,
} from "@/lib/phone-numbers-data";
import { PROVIDER_LABELS } from "@/lib/setup-data";

type PhoneNumbersTableProps = {
  numbers: PhoneNumber[];
};

function AgentCell({ name }: { name: string }) {
  if (name === "Unassigned" || !name) {
    return <span className="text-propnex-muted">Unassigned</span>;
  }
  return <span className="text-foreground">{name}</span>;
}

export function PhoneNumbersTable({ numbers }: PhoneNumbersTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="px-5 py-3 font-medium">Phone Number</th>
            <th className="px-5 py-3 font-medium">Provider</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Inbound Agent</th>
            <th className="px-5 py-3 font-medium">Outbound Agent</th>
            <th className="px-5 py-3 font-medium">Inbound Calls</th>
            <th className="px-5 py-3 font-medium">Outbound Calls</th>
            <th className="px-5 py-3 font-medium">Last Activity</th>
            <th className="px-5 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {numbers.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-5 py-12 text-center text-propnex-muted"
              >
                No phone numbers match your filters.
              </td>
            </tr>
          ) : (
            numbers.map((entry) => (
              <tr
                key={entry.id}
                className="cursor-pointer border-b border-propnex-border/70 last:border-b-0 hover:bg-propnex-accent/5"
                onClick={() => router.push(`/phone-numbers/${entry.id}`)}
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/phone-numbers/${entry.id}`}
                    className="font-mono font-medium text-propnex-accent hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {formatPhoneDisplay(entry.number)}
                  </Link>
                </td>
                <td className="px-5 py-4 text-propnex-muted">
                  {PROVIDER_LABELS[entry.provider]}
                </td>
                <td className="px-5 py-4">
                  <PhoneNumberStatusBadge status={entry.status} />
                </td>
                <td className="px-5 py-4">
                  <AgentCell name={entry.inboundAgentName} />
                </td>
                <td className="px-5 py-4">
                  <AgentCell name={entry.outboundAgentName} />
                </td>
                <td className="px-5 py-4 tabular-nums text-foreground">
                  {entry.inboundCallsCount.toLocaleString()}
                </td>
                <td className="px-5 py-4 tabular-nums text-foreground">
                  {entry.outboundCallsCount.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-propnex-muted">
                  {formatLastActivity(entry.lastActivityAt)}
                </td>
                <td className="px-5 py-4">
                  <PhoneNumberActionsMenu entry={entry} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
