"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SideNotificationType = "info" | "error" | "success";

type SideNotification = {
  id: string;
  type: SideNotificationType;
  message: string;
  duration?: number;
};

type NotifyOptions = {
  type: SideNotificationType;
  message: string;
  id?: string;
  duration?: number;
};

type SideNotificationContextValue = {
  notify: (options: NotifyOptions) => string;
  dismiss: (id: string) => void;
};

const SideNotificationContext =
  createContext<SideNotificationContextValue | null>(null);

const TYPE_STYLES: Record<SideNotificationType, string> = {
  info: "border-propnex-accent/30 bg-propnex-panel text-propnex-accent shadow-lg shadow-black/20",
  error: "border-destructive/30 bg-propnex-panel text-destructive shadow-lg shadow-black/20",
  success:
    "border-success/30 bg-propnex-panel text-success shadow-lg shadow-black/20",
};

function SideNotificationItem({
  notification,
  onDismiss,
}: {
  notification: SideNotification;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (notification.duration == null || notification.duration <= 0) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(notification.id), 200);
    }, notification.duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notification.duration, notification.id, onDismiss]);

  const Icon =
    notification.type === "error"
      ? AlertCircle
      : notification.type === "success"
        ? CheckCircle2
        : Loader2;

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-all duration-200 ease-out",
        TYPE_STYLES[notification.type],
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          notification.type === "info" && "animate-spin",
        )}
      />
      <p className="min-w-0 flex-1 leading-snug">{notification.message}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 opacity-70 hover:opacity-100"
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(notification.id), 200);
        }}
        aria-label="Dismiss notification"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

function SideNotificationHost({
  notifications,
  onDismiss,
}: {
  notifications: SideNotification[];
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed top-20 right-4 z-50 flex w-[min(100vw-2rem,24rem)] flex-col gap-2">
      {notifications.map((notification) => (
        <SideNotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>,
    document.body,
  );
}

export function SideNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<SideNotification[]>([]);
  const idCounterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const notify = useCallback(
    ({ type, message, id, duration }: NotifyOptions) => {
      const notificationId = id ?? `side-notification-${++idCounterRef.current}`;

      setNotifications((current) => {
        const withoutSameId = current.filter(
          (notification) => notification.id !== notificationId,
        );

        const next: SideNotification = {
          id: notificationId,
          type,
          message,
          duration:
            duration ??
            (type === "success" ? 5000 : type === "info" ? undefined : undefined),
        };

        return [...withoutSameId, next];
      });

      return notificationId;
    },
    [],
  );

  return (
    <SideNotificationContext.Provider value={{ notify, dismiss }}>
      {children}
      <SideNotificationHost
        notifications={notifications}
        onDismiss={dismiss}
      />
    </SideNotificationContext.Provider>
  );
}

export function useSideNotification() {
  const context = useContext(SideNotificationContext);

  if (!context) {
    throw new Error(
      "useSideNotification must be used within a SideNotificationProvider",
    );
  }

  return context;
}
