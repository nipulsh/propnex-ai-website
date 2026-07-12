"use client";

import { useCallback } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import type { SetupPageResult } from "@/lib/graphql/queries";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { useSetupStore } from "@/stores/setup-store";

export function useSetupGraphQL() {
  const setPhoneNumbersFromApi = useSetupStore((s) => s.setPhoneNumbersFromApi);
  const setIntegrationsFromApi = useSetupStore((s) => s.setIntegrationsFromApi);

  const applyPageData = useCallback(
    (data: SetupPageResult) => {
      setIntegrationsFromApi(data.integrations.list);
      setPhoneNumbersFromApi(data.phoneNumbers.list);
    },
    [setIntegrationsFromApi, setPhoneNumbersFromApi],
  );

  const fetchPage = useCallback(
    () => fetchCachedPage<SetupPageResult>("setup"),
    [],
  );

  useCachedPagePoll({
    loadKey: "setup",
    fetchPage,
    onData: applyPageData,
    onError: () => {
      // Setup wizard keeps local defaults on failure
    },
  });
}
