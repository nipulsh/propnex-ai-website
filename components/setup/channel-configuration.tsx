"use client";

import type { ComponentType } from "react";
import { Activity, Layers, Lock } from "lucide-react";

import { SetupSection } from "@/components/setup/setup-section";
import { OVERFLOW_OPTIONS } from "@/lib/setup-data";
import { cn } from "@/lib/utils";
import { useSetupStore } from "@/stores/setup-store";

type StatCardProps = {
  title: string;
  value: string;
  footer: string;
  icon: ComponentType<{ className?: string }>;
};

function StatCard({ title, value, footer, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-propnex-muted">{title}</p>
        <Icon className="size-5 shrink-0 text-propnex-accent" />
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-propnex-muted">{footer}</p>
    </article>
  );
}

export function ChannelConfiguration() {
  const channelUsage = useSetupStore((state) => state.channelUsage);
  const channelSettings = useSetupStore((state) => state.channelSettings);
  const updateChannelSettings = useSetupStore(
    (state) => state.updateChannelSettings,
  );

  return (
    <SetupSection
      title="Channel Configuration"
      description="View channel allocation and configure concurrent call handling."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Total Channels Assigned"
            value={channelUsage.totalAssigned.toString()}
            footer="Provisioned for your account"
            icon={Layers}
          />
          <StatCard
            title="Active Channels"
            value={channelUsage.active.toString()}
            footer="Currently in use"
            icon={Activity}
          />
          <StatCard
            title="Reserved Channels"
            value={channelUsage.reserved.toString()}
            footer="Held for overflow and failover"
            icon={Lock}
          />
        </div>

        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="text-sm font-medium text-foreground">
            Administrator Settings
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="max-concurrent-calls"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Maximum Concurrent Calls
              </label>
              <input
                id="max-concurrent-calls"
                type="number"
                min={1}
                max={channelUsage.totalAssigned}
                value={channelSettings.maxConcurrentCalls}
                onChange={(event) =>
                  updateChannelSettings({
                    maxConcurrentCalls: Number(event.target.value) || 1,
                  })
                }
                className="h-11 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="call-queue-limit"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Call Queue Limit
              </label>
              <input
                id="call-queue-limit"
                type="number"
                min={0}
                value={channelSettings.callQueueLimit}
                onChange={(event) =>
                  updateChannelSettings({
                    callQueueLimit: Number(event.target.value) || 0,
                  })
                }
                className="h-11 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Overflow Handling
            </p>
            <div className="flex flex-wrap gap-3">
              {OVERFLOW_OPTIONS.map((option) => {
                const isSelected =
                  channelSettings.overflowHandling === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateChannelSettings({ overflowHandling: option.value })
                    }
                    className={cn(
                      "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                      isSelected
                        ? "border-propnex-accent bg-propnex-accent/10 text-propnex-accent"
                        : "border-propnex-border bg-propnex-bg text-foreground hover:border-propnex-accent/50",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SetupSection>
  );
}
