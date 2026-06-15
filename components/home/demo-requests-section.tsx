"use client";

import { useState } from "react";
import { Calendar, Clock, Eye, MoreHorizontal, X } from "lucide-react";

import { DashboardSection } from "@/components/common/dashboard-section";
import {
  getDemosByStatus,
  getNextUpcomingDemo,
  type DemoRequest,
  type DemoStatus,
} from "@/lib/home-dashboard-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const TABS: { value: DemoStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
];

const STATUS_STYLES: Record<DemoStatus, string> = {
  upcoming: "text-propnex-accent bg-propnex-accent/10",
  completed: "text-success bg-success/10",
  pending: "text-orange-400 bg-orange-400/10",
};

function DemoRow({
  demo,
  onView,
}: {
  demo: DemoRequest;
  onView: (demo: DemoRequest) => void;
}) {
  const handlePlaceholder = (action: string) => {
    window.alert(`${action} for demo with ${demo.customerName} — coming soon.`);
  };

  return (
    <div className="flex flex-col gap-3 border-b border-propnex-border px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{demo.customerName}</p>
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
              STATUS_STYLES[demo.status],
            )}
          >
            {demo.status}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-propnex-muted">{demo.company}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-propnex-muted">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {demo.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {demo.time}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Demo actions">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(demo)}>
            <Eye className="size-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePlaceholder("Reschedule")}>
            <Calendar className="size-4" />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePlaceholder("Cancel")}>
            <X className="size-4" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function DemoRequestsSection() {
  const [activeTab, setActiveTab] = useState<DemoStatus>("upcoming");
  const [selectedDemo, setSelectedDemo] = useState<DemoRequest | null>(null);
  const nextDemo = getNextUpcomingDemo();
  const filtered = getDemosByStatus(activeTab);

  const hoursUntilNext =
    nextDemo && nextDemo.scheduledAt > Date.now()
      ? Math.round((nextDemo.scheduledAt - Date.now()) / 3600000)
      : null;

  return (
    <DashboardSection
      id="demo-requests"
      title="Demo Requests"
      description="Upcoming demonstrations and pending demo bookings."
    >
      {nextDemo && hoursUntilNext !== null && hoursUntilNext <= 48 ? (
        <div className="rounded-lg border border-propnex-accent/30 bg-propnex-accent/10 px-4 py-3 text-sm text-propnex-accent">
          <strong>Upcoming demo reminder:</strong> {nextDemo.customerName} from{" "}
          {nextDemo.company} — {nextDemo.date} at {nextDemo.time}
          {hoursUntilNext <= 24 ? " (within 24 hours)" : ` (in ${hoursUntilNext}h)`}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count = getDemosByStatus(tab.value).length;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "border-propnex-accent bg-propnex-accent/10 text-propnex-accent"
                  : "border-propnex-border text-propnex-muted hover:text-foreground",
              )}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-propnex-muted">
            No {activeTab} demos in this category.
          </p>
        ) : (
          filtered.map((demo) => (
            <DemoRow
              key={demo.id}
              demo={demo}
              onView={setSelectedDemo}
            />
          ))
        )}
      </div>

      <Sheet
        open={selectedDemo !== null}
        onOpenChange={(open) => !open && setSelectedDemo(null)}
      >
        <SheetContent>
          {selectedDemo ? (
            <>
              <SheetHeader>
                <SheetTitle>{selectedDemo.customerName}</SheetTitle>
                <SheetDescription>{selectedDemo.company}</SheetDescription>
              </SheetHeader>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-propnex-muted">Date</dt>
                  <dd className="font-medium text-foreground">{selectedDemo.date}</dd>
                </div>
                <div>
                  <dt className="text-propnex-muted">Time</dt>
                  <dd className="font-medium text-foreground">{selectedDemo.time}</dd>
                </div>
                <div>
                  <dt className="text-propnex-muted">Status</dt>
                  <dd className="font-medium capitalize text-foreground">
                    {selectedDemo.status}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </DashboardSection>
  );
}
