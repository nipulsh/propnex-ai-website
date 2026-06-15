"use client";

import { Download, FileText, Loader2, Mail } from "lucide-react";

import { BillingEmptyState } from "@/components/billing/billing-empty-state";
import { Button } from "@/components/ui/button";
import { BILLING_PRICING, formatInr } from "@/lib/billing-pricing";
import {
  QUOTE_STATUS_LABELS,
  formatResourceDate,
} from "@/lib/billing-resources-data";
import { useBillingStore } from "@/stores/billing-store";

export function QuoteGenerationSection() {
  const quotes = useBillingStore((state) => state.quotes);
  const activeQuote = useBillingStore((state) => state.activeQuote);
  const isGeneratingQuote = useBillingStore((state) => state.isGeneratingQuote);
  const isSendingEmail = useBillingStore((state) => state.isSendingEmail);
  const generateQuote = useBillingStore((state) => state.generateQuote);
  const downloadQuote = useBillingStore((state) => state.downloadQuote);
  const sendQuoteToEmail = useBillingStore((state) => state.sendQuoteToEmail);

  const displayQuote = activeQuote ?? quotes[0] ?? null;

  const scrollToBuilder = () => {
    document
      .getElementById("resource-request")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-propnex-muted">
          Generate a formal quote before committing to a purchase.
        </p>
        <Button
          onClick={() => generateQuote()}
          disabled={isGeneratingQuote}
        >
          {isGeneratingQuote ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="size-4" />
              Generate Quote
            </>
          )}
        </Button>
      </div>

      {displayQuote ? (
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Quote Summary
              </h3>
              <p className="mt-1 font-mono text-xs text-propnex-accent">
                {displayQuote.id}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-md bg-propnex-accent/10 px-2 py-0.5 text-xs font-medium text-propnex-accent">
              {QUOTE_STATUS_LABELS[displayQuote.status]}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Created Date
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatResourceDate(displayQuote.createdDate)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Total Cost
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {formatInr(displayQuote.pricing.grandTotal)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 space-y-2 border-t border-propnex-border pt-4 text-sm">
            {displayQuote.request.channelQty > 0 ? (
              <p className="text-propnex-muted">
                Channels:{" "}
                <span className="text-foreground">
                  {displayQuote.request.channelQty} (valid{" "}
                  {BILLING_PRICING.channels.validityMonths} months)
                </span>
              </p>
            ) : null}
            {displayQuote.request.virtualNumberQty > 0 ? (
              <p className="text-propnex-muted">
                Virtual Numbers:{" "}
                <span className="text-foreground">
                  {displayQuote.request.virtualNumberQty}
                </span>
              </p>
            ) : null}
            <p className="text-propnex-muted">
              Expected Call Volume:{" "}
              <span className="text-foreground">
                {displayQuote.request.expectedMonthlyCalls.toLocaleString(
                  "en-IN",
                )}{" "}
                calls/mo
              </span>
            </p>
            <p className="text-propnex-muted">
              Applied Pricing Tier:{" "}
              <span className="text-foreground">
                {displayQuote.pricing.callTier.label}
              </span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQuote(displayQuote.id)}
            >
              <Download className="size-3.5" />
              Download Quote
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuoteToEmail(displayQuote.id)}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Mail className="size-3.5" />
              )}
              Send To Email
            </Button>
          </div>
        </div>
      ) : (
        <BillingEmptyState
          title="No Active Quotes"
          description="Configure your resource request and generate a quote to share with your team or finance department."
          actionLabel="Configure Resources"
          onAction={scrollToBuilder}
        />
      )}
    </div>
  );
}
