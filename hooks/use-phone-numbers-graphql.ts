"use client";

import { useCallback } from "react";

import {
  createPhoneNumber as createPhoneNumberApi,
  fetchPhoneNumbersPage,
  updatePhoneNumber as updatePhoneNumberApi,
} from "@/lib/graphql/api";
import {
  mapGraphQLPhoneNumberToUI,
  mapUIPhoneNumberToCreateInput,
} from "@/lib/mappers/phone-number.mapper";
import type { TelephonyProvider } from "@/lib/setup-data";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

export function usePhoneNumbersGraphQL() {
  const setNumbers = usePhoneNumbersStore((s) => s.setNumbers);
  const setLoading = usePhoneNumbersStore((s) => s.setLoading);
  const setError = usePhoneNumbersStore((s) => s.setError);

  const applyPageData = useCallback(
    (data: Awaited<ReturnType<typeof fetchPhoneNumbersPage>>) => {
      const mapped = data.phoneNumbers.list.map((row) =>
        mapGraphQLPhoneNumberToUI(row as never),
      );
      setNumbers(mapped);
      setError(null);
    },
    [setError, setNumbers],
  );

  const fetchPage = useCallback(() => fetchPhoneNumbersPage(), []);

  const { reload } = useCachedPagePoll({
    fetchPage,
    onData: applyPageData,
    onError: (message) => setError(message),
    onLoading: setLoading,
  });

  return { reload };
}

export async function createPhoneNumberOnServer(input: {
  number: string;
  provider: TelephonyProvider;
  inboundAgentId: string;
  outboundAgentId: string;
}) {
  const result = await createPhoneNumberApi(
    mapUIPhoneNumberToCreateInput(input),
  );
  return mapGraphQLPhoneNumberToUI(result.phoneNumbers.create as never);
}

export async function updatePhoneNumberOnServer(
  id: string,
  input: Record<string, unknown>,
) {
  const result = await updatePhoneNumberApi(id, input);
  return mapGraphQLPhoneNumberToUI(result.phoneNumbers.update as never);
}
