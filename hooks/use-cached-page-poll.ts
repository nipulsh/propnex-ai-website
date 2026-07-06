"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  isAuthRequiredError,
  isGraphQLAuthBlocked,
  isUnauthorizedClientError,
  markGraphQLAuthBlocked,
} from "@/lib/graphql/auth-error";

const DEFAULT_INTERVAL_MS = 10_000;

/** Survives client navigations; cleared only on a full page reload. */
const completedInitialLoads = new Set<string>();

type ReloadOptions = {
  silent?: boolean;
  showLoading?: boolean;
};

type UseCachedPagePollOptions<T> = {
  enabled?: boolean;
  intervalMs?: number;
  deps?: unknown[];
  /** Stable key for this page's data (e.g. "home", `agent-detail:${id}`). */
  loadKey: string;
  fetchPage: () => Promise<T>;
  onData: (data: T) => void;
  onError?: (message: string) => void;
  onLoading?: (loading: boolean) => void;
  skipHidden?: boolean;
};

export function useCachedPagePoll<T>({
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
  deps = [],
  loadKey,
  fetchPage,
  onData,
  onError,
  onLoading,
  skipHidden = true,
}: UseCachedPagePollOptions<T>) {
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onLoadingRef = useRef(onLoading);
  onLoadingRef.current = onLoading;

  const intervalIdRef = useRef<number | null>(null);
  const authBlockedRef = useRef(isGraphQLAuthBlocked());

  const stopPolling = useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const reload = useCallback(
    async (options?: ReloadOptions) => {
      if (authBlockedRef.current || isGraphQLAuthBlocked()) {
        authBlockedRef.current = true;
        stopPolling();
        return;
      }

      if (skipHidden && document.visibilityState === "hidden") {
        return;
      }

      const silent = options?.silent ?? false;
      const hasLoadedOnce = completedInitialLoads.has(loadKey);
      const showLoading =
        options?.showLoading ??
        (!silent && !hasLoadedOnce);

      if (showLoading) {
        onLoadingRef.current?.(true);
      }
      try {
        const data = await fetchPageRef.current();
        onDataRef.current(data);
      } catch (error) {
        if (isAuthRequiredError(error) || isUnauthorizedClientError(error)) {
          authBlockedRef.current = true;
          markGraphQLAuthBlocked();
          stopPolling();
        }
        onErrorRef.current?.(
          error instanceof Error ? error.message : "Failed to load page data",
        );
      } finally {
        onLoadingRef.current?.(false);
        completedInitialLoads.add(loadKey);
      }
    },
    [loadKey, skipHidden, stopPolling],
  );

  useEffect(() => {
    if (!enabled) return;

    if (authBlockedRef.current || isGraphQLAuthBlocked()) {
      authBlockedRef.current = true;
      return;
    }

    void reload();
    intervalIdRef.current = window.setInterval(() => {
      void reload({ silent: true });
    }, intervalMs);

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps array controls refetch identity
  }, [enabled, intervalMs, reload, stopPolling, ...deps]);

  return { reload };
}
