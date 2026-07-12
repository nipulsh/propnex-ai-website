"use client";

import {
  formatLastContact,
  type DormantLead,
} from "@/lib/lead-reactivation-data";
import { cn } from "@/lib/utils";

type LeadReactivationTableProps = {
  leads: DormantLead[];
};

function StatusBadge({ status }: { status: DormantLead["status"] }) {
  const styles: Record<DormantLead["status"], string> = {
    dormant: "text-orange-400 bg-orange-400/10",
    scheduled: "text-propnex-accent bg-propnex-accent/10",
    contacted: "text-cyan-400 bg-cyan-400/10",
    reactivated: "text-success bg-success/10",
    "no-response": "text-propnex-muted bg-propnex-muted/10",
  };

  const labels: Record<DormantLead["status"], string> = {
    dormant: "Dormant",
    scheduled: "Scheduled",
    contacted: "Contacted",
    reactivated: "Reactivated",
    "no-response": "No Response",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

export function LeadReactivationTable({ leads }: LeadReactivationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="px-5 py-3 font-medium">Contact</th>
            <th className="hidden px-5 py-3 font-medium md:table-cell">
              Last Contact
            </th>
            <th className="px-5 py-3 font-medium">Days Inactive</th>
            <th className="hidden px-5 py-3 font-medium lg:table-cell">
              Source
            </th>
            <th className="hidden px-5 py-3 font-medium md:table-cell">
              Agent
            </th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-12 text-center text-propnex-muted"
              >
                No leads match your filters.
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-propnex-border/70 last:border-b-0"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-foreground">
                    {lead.contactName}
                  </p>
                  <p className="mt-0.5 text-xs text-propnex-muted">
                    {lead.phoneNumber}
                  </p>
                </td>
                <td className="hidden px-5 py-4 text-foreground md:table-cell">
                  {formatLastContact(lead.lastContactAt)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "font-medium",
                      lead.daysInactive >= 90
                        ? "text-destructive"
                        : lead.daysInactive >= 60
                          ? "text-orange-400"
                          : "text-foreground",
                    )}
                  >
                    {lead.daysInactive} days
                  </span>
                </td>
                <td className="hidden px-5 py-4 text-propnex-muted lg:table-cell">
                  {lead.source}
                </td>
                <td className="hidden px-5 py-4 text-foreground md:table-cell">
                  {lead.agentName}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={lead.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
