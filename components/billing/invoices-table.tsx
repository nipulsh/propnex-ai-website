"use client";

import { useState } from "react";

import { BillingEmptyState } from "@/components/billing/billing-empty-state";
import { PurchaseStatusBadge } from "@/components/billing/purchase-status-badge";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/billing-pricing";
import {
  formatResourceDate,
  type PurchaseHistoryItem,
} from "@/lib/billing-resources-data";
import { useBillingStore } from "@/stores/billing-store";

export function InvoicesTable() {
  const purchaseHistory = useBillingStore((s) => s.purchaseHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (purchaseHistory.length === 0) {
    return (
      <BillingEmptyState
        title="No invoices yet"
        description="Your invoices will appear here after your first purchase."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-propnex-border bg-propnex-panel">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="px-5 py-3 font-medium">Invoice</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Resource</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {purchaseHistory.map((item: PurchaseHistoryItem) => (
            <tr
              key={item.id}
              className="border-b border-propnex-border last:border-b-0"
            >
              <td className="px-5 py-4 font-mono text-foreground">
                {item.invoiceId}
              </td>
              <td className="px-5 py-4 text-propnex-muted">
                {formatResourceDate(item.purchaseDate)}
              </td>
              <td className="px-5 py-4 text-foreground">{item.resourceType}</td>
              <td className="px-5 py-4 font-semibold text-foreground">
                {formatInr(item.amount)}
              </td>
              <td className="px-5 py-4">
                <PurchaseStatusBadge status={item.status} />
              </td>
              <td className="px-5 py-4">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                >
                  {expandedId === item.id ? "Hide" : "Details"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
