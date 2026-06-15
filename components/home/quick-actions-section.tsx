"use client";

import { useState } from "react";
import {
  Bot,
  Calendar,
  CreditCard,
  FileUp,
  Megaphone,
  PhoneCall,
} from "lucide-react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { QuickActionCard } from "@/components/home/quick-action-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const ACTIONS = [
  {
    title: "Create Agent",
    description: "Build a new AI voice agent",
    icon: Bot,
    href: "/agents",
  },
  {
    title: "Launch Campaign",
    description: "Start outbound outreach",
    icon: Megaphone,
    href: "/lead-reactivation",
  },
  {
    title: "Upload Contacts",
    description: "Import contact lists via CSV",
    icon: FileUp,
    href: "/upload-csv",
  },
  {
    title: "Schedule Demo",
    description: "Book a product demonstration",
    icon: Calendar,
    action: "demo" as const,
  },
  {
    title: "View Call Logs",
    description: "Review call history",
    icon: PhoneCall,
    href: "/call-logs",
  },
  {
    title: "Manage Billing",
    description: "Credits and resources",
    icon: CreditCard,
    href: "/billing",
  },
];

export function QuickActionsSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <DashboardSection
      title="Quick Actions"
      description="Frequently used shortcuts for your workspace."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-2">
        {ACTIONS.map((action) =>
          action.action === "demo" ? (
            <QuickActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={() => setDemoOpen(true)}
            />
          ) : (
            <QuickActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
            />
          ),
        )}
      </div>

      <Sheet open={demoOpen} onOpenChange={setDemoOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Schedule Demo</SheetTitle>
            <SheetDescription>
              Request a product demonstration with the PropNex team.
            </SheetDescription>
          </SheetHeader>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              window.alert("Demo request submitted — coming soon.");
              setDemoOpen(false);
            }}
          >
            <div className="space-y-2">
              <label htmlFor="demo-name" className="text-sm text-propnex-muted">
                Your Name
              </label>
              <Input id="demo-name" placeholder="Full name" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="demo-company" className="text-sm text-propnex-muted">
                Company
              </label>
              <Input id="demo-company" placeholder="Company name" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="demo-email" className="text-sm text-propnex-muted">
                Email
              </label>
              <Input id="demo-email" type="email" placeholder="you@company.com" required />
            </div>
            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </DashboardSection>
  );
}
