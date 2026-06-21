"use client";

import { useCallback, useEffect } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import { mapGraphQLCallLogToUI } from "@/lib/mappers/agent.mapper";
import { mapGraphQLPhoneNumberToUI } from "@/lib/mappers/phone-number.mapper";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { usePhoneNumberDetailStore } from "@/stores/phone-number-detail-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

export function usePhoneNumberDetailGraphQL(phoneNumberId: string) {
  const upsertNumber = usePhoneNumbersStore((s) => s.upsertNumber);
  const setLoading = usePhoneNumberDetailStore((s) => s.setLoading);
  const setError = usePhoneNumberDetailStore((s) => s.setError);
  const hydrate = usePhoneNumberDetailStore((s) => s.hydrate);
  const setCalls = usePhoneNumberDetailStore((s) => s.setCalls);
  const reset = usePhoneNumberDetailStore((s) => s.reset);

  const applyPageData = useCallback(
    (data: {
      phoneNumbers: { byId: Record<string, unknown> | null };
      callLogs: {
        connection: {
          edges: {
            node: Record<string, unknown>;
          }[];
        };
      };
    }) => {
      const phoneNumber = data.phoneNumbers.byId;

      if (!phoneNumber) {
        setError("Phone number not found");
        return;
      }

      const mapped = mapGraphQLPhoneNumberToUI(phoneNumber as never);
      upsertNumber(mapped);

      const calls = data.callLogs.connection.edges.map((edge) => {
        const node = edge.node as {
          id: string;
          startedAt: string;
          direction: string;
          status: string;
          durationSeconds: number;
          lead?: {
            id: string;
            firstName?: string | null;
            lastName?: string | null;
          } | null;
          aiAgent?: { id: string; name: string } | null;
        };
        const call = mapGraphQLCallLogToUI(
          node,
          node.aiAgent?.id ?? "",
          node.aiAgent?.name ?? "Unassigned",
        );
        return {
          ...call,
          phoneNumberId,
          phoneNumber: mapped.number,
          lineLabel: mapped.number,
        };
      });

      setCalls(calls);
      hydrate(phoneNumberId);
      setError(null);
    },
    [hydrate, phoneNumberId, setCalls, setError, upsertNumber],
  );

  const fetchPage = useCallback(
    () =>
      fetchCachedPage<{
        phoneNumbers: { byId: Record<string, unknown> | null };
        callLogs: {
          connection: {
            edges: {
              node: Record<string, unknown>;
            }[];
          };
        };
      }>("phone-detail", { id: phoneNumberId }),
    [phoneNumberId],
  );

  const { reload } = useCachedPagePoll({
    enabled: Boolean(phoneNumberId),
    fetchPage,
    onData: applyPageData,
    onError: (message) => setError(message),
    onLoading: setLoading,
    deps: [phoneNumberId],
  });

  useEffect(() => {
    reset();
  }, [phoneNumberId, reset]);

  return { reload };
}
