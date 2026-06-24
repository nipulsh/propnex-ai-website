"use client";

import { useEffect, useRef } from "react";

import {
  useSideNotification,
  type SideNotificationType,
} from "@/components/common/side-notification";

/** Survives client navigations; cleared only on a full page reload. */
const completedLoadingNotifications = new Set<string>();

type UsePageStatusNotificationOptions = {
  isInitialLoading: boolean;
  loadingMessage: string;
  loadingId?: string;
  error?: string | null;
  onErrorClear?: () => void;
};

export function usePageStatusNotification({
  isInitialLoading,
  loadingMessage,
  loadingId = "page-loading",
  error,
  onErrorClear,
}: UsePageStatusNotificationOptions) {
  const { notify, dismiss } = useSideNotification();
  const lastErrorRef = useRef<string | null>(null);
  const showLoadingNotification =
    isInitialLoading && !completedLoadingNotifications.has(loadingId);

  useEffect(() => {
    if (!isInitialLoading) {
      completedLoadingNotifications.add(loadingId);
    }
  }, [isInitialLoading, loadingId]);

  useEffect(() => {
    if (showLoadingNotification) {
      notify({
        id: loadingId,
        type: "info",
        message: loadingMessage,
      });
      return;
    }

    dismiss(loadingId);
  }, [showLoadingNotification, loadingMessage, loadingId, notify, dismiss]);

  useEffect(() => {
    if (!error) {
      lastErrorRef.current = null;
      return;
    }

    if (error === lastErrorRef.current) {
      return;
    }

    lastErrorRef.current = error;
    notify({
      type: "error",
      message: error,
    });
    onErrorClear?.();
  }, [error, notify, onErrorClear]);
}

type UseActionNotificationOptions = {
  message: string | null;
  type: SideNotificationType;
  duration?: number;
  onClear?: () => void;
};

export function useActionNotification({
  message,
  type,
  duration,
  onClear,
}: UseActionNotificationOptions) {
  const { notify } = useSideNotification();
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!message) {
      lastMessageRef.current = null;
      return;
    }

    if (message === lastMessageRef.current) {
      return;
    }

    lastMessageRef.current = message;
    notify({ type, message, duration });
    onClear?.();
  }, [message, type, duration, notify, onClear]);
}
