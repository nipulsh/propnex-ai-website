"use client";

import { Loader2 } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type SidebarNavigationContextValue = {
  isNavigating: boolean;
  navigatingTo: string | null;
  navigateTo: (href: string) => void;
};

const SidebarNavigationContext =
  createContext<SidebarNavigationContextValue | null>(null);

function matchesRoute(href: string, pathname: string) {
  const hrefPath = href.split("?")[0];
  if (hrefPath === "/dashboard") return pathname === "/dashboard";
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

export function SidebarNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      setNavigatingTo(null);
    }
  }, [pathname]);

  const navigateTo = useCallback(
    (href: string) => {
      if (matchesRoute(href, pathname) || isPending || navigatingTo) {
        return;
      }

      setNavigatingTo(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [isPending, navigatingTo, pathname, router],
  );

  const isNavigating = isPending || navigatingTo !== null;

  return (
    <SidebarNavigationContext.Provider
      value={{ isNavigating, navigatingTo, navigateTo }}
    >
      {children}
    </SidebarNavigationContext.Provider>
  );
}

export function useSidebarNavigation() {
  const context = useContext(SidebarNavigationContext);
  if (!context) {
    throw new Error(
      "useSidebarNavigation must be used within SidebarNavigationProvider.",
    );
  }
  return context;
}

export function SidebarNavigationLoader() {
  const { isNavigating } = useSidebarNavigation();

  if (!isNavigating) {
    return null;
  }

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
    >
      <Loader2 className="size-5 animate-spin text-propnex-muted" />
    </div>
  );
}
