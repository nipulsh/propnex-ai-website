"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileUp,
  Megaphone,
  PhoneCall,
  ServerCog,
  Target,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    step: 1,
    title: "Add Agent",
    description:
      "Create an AI voice agent tailored to your business — sales, support, or scheduling.",
    href: "/agents",
    icon: Bot,
  },
  {
    step: 2,
    title: "Configure Setup",
    description:
      "Assign phone numbers, set up channels, and connect your telephony provider.",
    href: "/setup",
    icon: ServerCog,
  },
  {
    step: 3,
    title: "Upload Leads",
    description:
      "Import your contact list via CSV. PropNex AI automatically categorizes leads as hot, warm, or cold.",
    href: "/upload-csv",
    icon: FileUp,
  },
  {
    step: 4,
    title: "Launch Campaign",
    description:
      "Start outbound calling campaigns from your dashboard and reach leads at scale.",
    href: "/dashboard",
    icon: Megaphone,
  },
  {
    step: 5,
    title: "Analyze Calls",
    description:
      "Review call logs, transcripts, and AI summaries to understand every conversation.",
    href: "/call-logs",
    icon: PhoneCall,
  },
  {
    step: 6,
    title: "Convert Leads",
    description:
      "Track hot leads, measure conversion rates, and close deals faster.",
    href: "/dashboard",
    icon: Target,
  },
];

export function HowItWorksPageContent() {
  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title="How It Works"
        description="Get from zero to converting leads in six simple steps."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STEPS.map((item) => (
          <article
            key={item.step}
            className="flex flex-col rounded-xl border border-propnex-border bg-propnex-panel p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-propnex-accent/10 text-propnex-accent">
                <item.icon className="size-5" />
              </div>
              <span className="text-xs font-medium text-propnex-muted">
                Step {item.step}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-propnex-muted">
              {item.description}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-fit gap-1 px-0 text-propnex-accent hover:bg-transparent"
              nativeButton={false}
              render={<Link href={item.href} />}
            >
              Get started
              <ArrowRight className="size-3.5" />
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
