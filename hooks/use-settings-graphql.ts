"use client";

import { useEffect } from "react";

import { fetchSettingsPage } from "@/lib/graphql/api";
import { useSettingsStore } from "@/stores/settings-store";

export function useSettingsGraphQL() {
  const setViewer = useSettingsStore((s) => s.setViewer);
  const setIntegrations = useSettingsStore((s) => s.setIntegrations);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchSettingsPage();
        if (cancelled) return;
        setViewer(data.viewer);
        setIntegrations(data.integrations.list);
      } catch {
        // Clerk profile remains primary fallback
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [setIntegrations, setViewer]);
}
