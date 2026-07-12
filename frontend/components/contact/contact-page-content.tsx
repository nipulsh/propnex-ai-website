"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Clock3,
  Coins,
  Headphones,
  Radio,
  Receipt,
} from "lucide-react";

import { BillingRequestForm } from "@/components/contact/billing-request-form";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  BILLING_PRICING,
  formatInr,
} from "@/lib/billing-pricing";
import {
  getBillingContactIntentMeta,
  parseBillingContactIntent,
} from "@/lib/billing-contact";
import { USAGE_RATES } from "@/lib/credit-usage";
import { useSettingsGraphQL } from "@/hooks/use-settings-graphql";
import { useSetupStore } from "@/stores/setup-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useUsageStore } from "@/stores/usage-store";

const NEXT_STEPS = [
  {
    icon: Receipt,
    title: "We review your request",
    description:
      "Our billing team validates quantities, pricing, and account status.",
  },
  {
    icon: Clock3,
    title: "Quote within 1 business day",
    description:
      "You will receive a formal quote with GST and payment instructions.",
  },
  {
    icon: Headphones,
    title: "Credits or channels provisioned",
    description:
      "Once confirmed, resources are added to your workspace automatically.",
  },
] as const;

export function ContactPageContent() {
  useSettingsGraphQL();

  const searchParams = useSearchParams();
  const intent = parseBillingContactIntent(searchParams.get("intent"));
  const intentMeta = getBillingContactIntentMeta(intent);

  const viewer = useSettingsStore((s) => s.viewer);
  const remainingCredits = useUsageStore((s) => s.remainingCredits);
  const creditsHydrated = useUsageStore((s) => s.creditsHydrated);
  const channelUsage = useSetupStore((s) => s.channelUsage);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title={intentMeta.title}
        description="Tell us what you need and our billing team will follow up with a quote."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <BillingRequestForm />

        <aside className="space-y-4">
          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="size-4 text-propnex-accent" />
              Account snapshot
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-propnex-muted">Company</dt>
                <dd className="text-right text-foreground">
                  {viewer?.company.name ?? "Loading…"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-propnex-muted">Available credits</dt>
                <dd className="text-right font-medium text-foreground">
                  {creditsHydrated
                    ? remainingCredits.toLocaleString("en-IN")
                    : "…"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-propnex-muted">Assigned channels</dt>
                <dd className="text-right text-foreground">
                  {channelUsage.totalChannels}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
            <p className="text-sm font-medium text-foreground">
              Current pricing
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Coins className="mt-0.5 size-4 shrink-0 text-propnex-accent" />
                <div>
                  <p className="font-medium text-foreground">Credits</p>
                  <p className="text-propnex-muted">
                    ₹{USAGE_RATES.inrPerCredit.toFixed(2)} per credit
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Radio className="mt-0.5 size-4 shrink-0 text-propnex-accent" />
                <div>
                  <p className="font-medium text-foreground">Channels</p>
                  <p className="text-propnex-muted">
                    {formatInr(BILLING_PRICING.channels.costPerUnit)} per
                    channel · min {BILLING_PRICING.channels.minPurchase}
                  </p>
                </div>
              </li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              nativeButton={false}
              render={<Link href="/billing" />}
            >
              View billing overview
            </Button>
          </div>

          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
            <p className="text-sm font-medium text-foreground">What happens next</p>
            <ol className="mt-4 space-y-4">
              {NEXT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-propnex-bg text-propnex-accent">
                    <step.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      <span className="mr-1 text-propnex-muted">
                        {index + 1}.
                      </span>
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-propnex-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
