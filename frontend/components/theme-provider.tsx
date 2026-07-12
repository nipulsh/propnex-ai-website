"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "dark";

// Identical on server and client — no prop divergence (e.g. next-themes' nonce
// mismatch), so React hydrates this node instead of recreating it client-side.
// A recreated inline <script> never executes, which is what caused the
// "Encountered a script tag while rendering" warning under React 19.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}")||"${DEFAULT_THEME}";if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var c=document.documentElement.classList;c.remove("light","dark");c.add(t);document.documentElement.style.colorScheme=t;}catch(e){}})();`;

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = React.useCallback((theme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* localStorage unavailable (private mode, etc.) — theme just won't persist */
    }
    applyTheme(theme);
  }, []);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (stored === "system" || !stored) applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ setTheme }}>
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
