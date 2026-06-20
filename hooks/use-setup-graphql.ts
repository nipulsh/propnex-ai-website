"use client";

import { useEffect } from "react";

import { fetchSetupPage } from "@/lib/graphql/api";
import { useSetupStore } from "@/stores/setup-store";

export function useSetupGraphQL() {
  const setPhoneNumbersFromApi = useSetupStore((s) => s.setPhoneNumbersFromApi);
  const setIntegrationsFromApi = useSetupStore((s) => s.setIntegrationsFromApi);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchSetupPage();
        if (cancelled) return;

        setIntegrationsFromApi(data.integrations.list);
        setPhoneNumbersFromApi(data.phoneNumbers.list);
      } catch {
        // Setup wizard keeps local defaults on failure
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [setIntegrationsFromApi, setPhoneNumbersFromApi]);
}
