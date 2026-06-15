"use client";

import { Fragment, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";

import { BillingEmptyState } from "@/components/billing/billing-empty-state";
import { PurchaseStatusBadge } from "@/components/billing/purchase-status-badge";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/billing-pricing";
import {
  formatResourceDate,
  type PurchaseHistoryItem,
} from "@/lib/billing-resources-data";
import { useBillingStore } from "@/stores/billing-store";

function InvoiceDetail({
  item,
  onClose,
}: {
  item: PurchaseHistoryItem;
  onClose: () => void;
}) {
  return (
    <div className="border-t border-propnex-border bg-propnex-panel/50 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Invoice {item.invoiceId}
          </h4>
          <p className="mt-1 text-xs text-propnex-muted">
            {formatResourceDate(item.purchaseDate)}
          </p>
        </div>
        <Button variant="ghost" size="xs" onClick={onClose}>
          Close
        </Button>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
            Resource
          </dt>
          <dd className="mt-0.5 text-foreground">{item.resourceType}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
            Quantity
          </dt>
          <dd className="mt-0.5 text-foreground">{item.quantity}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
            Amount
          </dt>
          <dd className="mt-0.5 font-semibold text-foreground">
            {formatInr(item.amount)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
            Status
          </dt>
          <dd className="mt-0.5">
            <PurchaseStatusBadge status={item.status} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function PurchaseHistoryTable() {
  const purchaseHistory = useBillingStore((state) => state.purchaseHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const scrollToBuilder = () => {
    document
      .getElementById("resource-request")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (purchaseHistory.length === 0) {
    return (
      <BillingEmptyState
        title="No Purchase History"
        description="Your completed and pending purchases will appear here once you make your first resource purchase."
        actionLabel="Request Resources"
        onAction={scrollToBuilder}
      />
    );
  }

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel">
      <div className="flex flex-col gap-3 border-b border-propnex-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Purchase History
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
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
              <th className="px-5 py-3 font-medium">Purchase Date</th>
              <th className="px-5 py-3 font-medium">Resource Type</th>
              <th className="px-5 py-3 font-medium">Quantity</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {purchaseHistory.map((item) => (
              <Fragment key={item.id}>
                <tr
                  className="border-b border-propnex-border/70 last:border-b-0 hover:bg-propnex-accent/5"
                >
                  <td className="px-5 py-4 text-propnex-muted">
                    {formatResourceDate(item.purchaseDate)}
                  </td>
                  <td className="px-5 py-4 text-foreground">
                    {item.resourceType}
                  </td>
                  <td className="px-5 py-4 text-foreground">
                    {item.quantity.toLocaleString("en-IN")}
                  </td>
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
                      <FileText className="size-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
                {expandedId === item.id ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <InvoiceDetail
                        item={item}
                        onClose={() => setExpandedId(null)}
                      />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
