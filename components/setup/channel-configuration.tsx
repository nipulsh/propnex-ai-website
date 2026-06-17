"use client";

import { Layers } from "lucide-react";

import { SetupSection } from "@/components/setup/setup-section";
import { useSetupStore } from "@/stores/setup-store";

export function ChannelConfiguration() {
  const channelUsage = useSetupStore((state) => state.channelUsage);

  return (
    <SetupSection
      title="Channel Configuration"
      description="Total concurrent calling channels available on your account."
    >
      <article className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-propnex-muted">Total Channels</p>
          <Layers className="size-5 shrink-0 text-propnex-accent" />
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          {channelUsage.totalChannels}
        </p>
        <p className="mt-1 text-sm text-propnex-muted">
          Concurrent calls your workspace can handle
        </p>
      </article>
    </SetupSection>
  );
}
