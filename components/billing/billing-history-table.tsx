import { ExternalLink } from "lucide-react";

import { billingHistory } from "@/lib/billing-data";

export function BillingHistoryTable() {
  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel">
      <div className="flex flex-col gap-3 border-b border-propnex-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Billing History
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-propnex-accent transition-colors hover:text-propnex-accent-secondary"
        >
          View All Invoices
          <ExternalLink className="size-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((item) => (
              <tr
                key={item.id}
                className="border-b border-propnex-border/70 last:border-b-0"
              >
                <td className="px-5 py-4 text-propnex-muted">{item.date}</td>
                <td className="px-5 py-4 text-foreground">
                  {item.description}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-foreground">
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
