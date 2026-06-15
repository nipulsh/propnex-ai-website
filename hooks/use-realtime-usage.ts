"use client";

import { useEffect } from "react";

import { calculateActiveChannelTick } from "@/lib/credit-usage";
import { useSetupStore } from "@/stores/setup-store";
import { useUsageStore } from "@/stores/usage-store";

const TICK_INTERVAL_MS = 1000;

/**
 * Simulates live credit and money consumption based on active telephony channels.
 * Mount once inside the dashboard layout so usage metrics update in real time.
 */
export function useRealtimeUsage() {
  const activeChannels = useSetupStore((state) => state.channelUsage.active);
  const recordUsage = useUsageStore((state) => state.recordUsage);

  useEffect(() => {
    if (activeChannels <= 0) {
      return;
    }

    const elapsedSeconds = TICK_INTERVAL_MS / 1000;
    const intervalId = window.setInterval(() => {
      const delta = calculateActiveChannelTick(activeChannels, elapsedSeconds);
      if (delta.credits || delta.moneyInr) {
        recordUsage(delta);
      }
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeChannels, recordUsage]);
}
