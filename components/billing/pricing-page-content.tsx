import Link from "next/link";
import { ArrowLeft, Check, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { creditPacks, subscriptionPlans } from "@/lib/billing-data";
import { cn } from "@/lib/utils";

function PricingHeader() {
  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/billing" />}
        className="w-fit gap-2 px-0 text-propnex-muted hover:bg-transparent hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Billing
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Pricing & Credits
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-propnex-muted">
          Choose a subscription plan or purchase additional credits for your
          voice agents. All plans include call monitoring and analytics.
        </p>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  credits,
  features,
  popular,
}: (typeof subscriptionPlans)[number]) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-xl border bg-propnex-panel p-6",
        popular
          ? "border-propnex-accent shadow-[0_0_24px_color-mix(in_srgb,var(--propnex-accent)_18%,transparent)]"
          : "border-propnex-border",
      )}
    >
      {popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-propnex-accent px-3 py-0.5 text-xs font-medium text-propnex-bg">
          Most Popular
        </span>
      ) : null}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="mt-1 text-sm text-propnex-muted">{description}</p>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-semibold text-foreground">${price}</span>
          <span className="text-sm text-propnex-muted">/{period}</span>
        </p>
        <p className="mt-2 text-sm text-propnex-accent">
          {credits.toLocaleString()} credits included
        </p>
      </div>

      <ul className="mb-6 flex flex-1 flex-col gap-2.5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-foreground"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-propnex-accent" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={popular ? "default" : "outline"}
        className={cn(
          "h-10 w-full",
          popular &&
            "shadow-[0_0_20px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]",
        )}
      >
        {popular ? "Upgrade Plan" : "Select Plan"}
      </Button>
    </article>
  );
}

function CreditPackCard({ credits, price, popular }: (typeof creditPacks)[number]) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border bg-propnex-panel p-5",
        popular ? "border-propnex-accent" : "border-propnex-border",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-foreground">
            {credits.toLocaleString()}
          </p>
          <p className="text-sm text-propnex-muted">Credits</p>
        </div>
        {popular ? (
          <span className="rounded-md bg-[color-mix(in_srgb,var(--propnex-accent)_15%,var(--propnex-panel))] px-2 py-0.5 text-xs font-medium text-propnex-accent">
            Best Value
          </span>
        ) : null}
      </div>

      <p className="mb-5 text-2xl font-semibold text-foreground">${price}</p>

      <Button
        variant={popular ? "default" : "outline"}
        className="mt-auto h-9 w-full"
      >
        Purchase
      </Button>
    </article>
  );
}

export function PricingPageContent() {
  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain p-6">
      <PricingHeader />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-propnex-accent" />
          <h2 className="text-base font-semibold text-foreground">
            Subscription Plans
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <PlanCard key={plan.id} {...plan} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-propnex-accent" />
          <h2 className="text-base font-semibold text-foreground">
            Credit Packs
          </h2>
        </div>
        <p className="text-sm text-propnex-muted">
          Need more capacity before your next billing cycle? Add credits
          instantly without changing your plan.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {creditPacks.map((pack) => (
            <CreditPackCard key={pack.id} {...pack} />
          ))}
        </div>
      </section>
    </div>
  );
}
