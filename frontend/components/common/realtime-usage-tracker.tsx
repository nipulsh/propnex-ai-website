"use client";

import { useRealtimeUsage } from "@/hooks/use-realtime-usage";

export function RealtimeUsageTracker() {
  useRealtimeUsage();
  return null;
}
