"use client";

import { useCallback } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import type { UploadedContactsListResult } from "@/lib/graphql/queries";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { useContactPhonesStore } from "@/stores/contact-phones-store";

export function useContactPhonesGraphQL() {
  const setContacts = useContactPhonesStore((s) => s.setContacts);
  const setLoading = useContactPhonesStore((s) => s.setLoading);
  const setError = useContactPhonesStore((s) => s.setError);

  const applyPageData = useCallback(
    (data: UploadedContactsListResult) => {
      setContacts(data.uploadedContacts.list);
      setError(null);
    },
    [setContacts, setError],
  );

  const fetchPage = useCallback(
    () => fetchCachedPage<UploadedContactsListResult>("phone-contacts"),
    [],
  );

  const { reload } = useCachedPagePoll({
    loadKey: "phone-contacts",
    fetchPage,
    onData: applyPageData,
    onError: (message) => setError(message),
    onLoading: setLoading,
    deps: [],
  });

  return { reload };
}
