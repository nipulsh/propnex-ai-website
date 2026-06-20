"use client";

import { useState } from "react";

import { BillingEmptyState } from "@/components/billing/billing-empty-state";
import { Button } from "@/components/ui/button";
import { useBillingStore } from "@/stores/billing-store";

function formatInvoiceDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(cents: number, currency: string) {
  const amount = cents / 100;
  if (currency.toUpperCase() === "INR") {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
}

export function InvoicesTable() {
  const invoices = useBillingStore((s) => s.invoices);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (invoices.length === 0) {
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
            <th className="px-5 py-3 font-medium">Description</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {invoices.map((item) => (
            <tr
              key={item.id}
              className="border-b border-propnex-border last:border-b-0"
            >
              <td className="px-5 py-4 font-mono text-foreground">{item.id}</td>
              <td className="px-5 py-4 text-propnex-muted">
                {formatInvoiceDate(item.issuedAt)}
              </td>
              <td className="px-5 py-4 text-foreground">
                {item.description ?? "—"}
              </td>
              <td className="px-5 py-4 font-semibold text-foreground">
                {formatAmount(item.amountCents, item.currency)}
              </td>
              <td className="px-5 py-4 capitalize text-foreground">
                {item.status.toLowerCase()}
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
