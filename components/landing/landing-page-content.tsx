import Link from "next/link";
import { Bot, PhoneCall, Sparkles, TrendingUp, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Bot,
    title: "AI Voice Agents",
    description:
      "Deploy intelligent voice agents that handle inbound and outbound calls around the clock.",
  },
  {
    icon: PhoneCall,
    title: "Call Monitoring",
    description:
      "Track every conversation with real-time analytics, transcripts, and performance insights.",
  },
  {
    icon: TrendingUp,
    title: "Lead Reactivation",
    description:
      "Automatically re-engage dormant leads with personalized AI-driven outreach campaigns.",
  },
];

export function LandingPageContent() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="flex flex-col items-center py-24 text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-propnex-border bg-propnex-panel px-3 py-1 text-xs font-medium text-propnex-accent">
          <Sparkles className="size-3.5" />
          AI-powered voice agents for real estate
        </span>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Automate your calls.{" "}
          <span className="text-propnex-accent">Close more deals.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base text-propnex-muted sm:text-lg">
          PropNex AI gives your team AI voice agents that qualify leads, book
          appointments, and follow up — so you can focus on closing.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/sign-up" />}
            className="h-10 px-6 shadow-[0_0_20px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]"
          >
            Get started free
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/pricing" />}
            className="h-10 px-6"
          >
            View pricing
          </Button>
        </div>
      </section>

      <section className="grid gap-6 pb-16 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-xl border border-propnex-border bg-propnex-panel p-6"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-propnex-muted">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="mb-24 rounded-2xl border border-propnex-border bg-propnex-panel p-8 text-center sm:p-12">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <Zap className="mb-4 size-8 text-propnex-accent" />
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Ready to transform your outreach?
          </h2>
          <p className="mt-3 text-sm text-propnex-muted">
            Start with a free account and scale as your business grows. No credit
            card required.
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/sign-up" />}
            className="mt-6 h-10 px-6"
          >
            Create your account
          </Button>
        </div>
      </section>
    </div>
  );
}
