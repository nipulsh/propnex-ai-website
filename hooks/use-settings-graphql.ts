"use client";

import { useCallback } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import type { SettingsPageResult } from "@/lib/graphql/queries";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { useSettingsStore } from "@/stores/settings-store";

export function useSettingsGraphQL() {
  const setViewer = useSettingsStore((s) => s.setViewer);
  const setIntegrations = useSettingsStore((s) => s.setIntegrations);

  const applyPageData = useCallback(
    (data: SettingsPageResult) => {
      setViewer(data.viewer);
      setIntegrations(data.integrations.list);
    },
    [setIntegrations, setViewer],
  );

  const fetchPage = useCallback(
    () => fetchCachedPage<SettingsPageResult>("settings"),
    [],
  );

  useCachedPagePoll({
    fetchPage,
    onData: applyPageData,
    onError: () => {
      // Clerk profile remains primary fallback
    },
  });
}
