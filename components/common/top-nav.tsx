"use client";

import Link from "next/link";
import { Coins, IndianRupee } from "lucide-react";

import { AssistantChatPanel } from "@/components/common/assistant-chat-panel";
import { ModeToggle } from "@/components/common/mode-toggle";
import { formatInr } from "@/lib/billing-pricing";
import { useUsageStore } from "@/stores/usage-store";

export function TopNav() {
  const remainingCredits = useUsageStore((state) => state.remainingCredits);
  const moneyUsedInr = useUsageStore((state) => state.moneyUsedInr);

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border px-6">
      <ModeToggle />
      <AssistantChatPanel />

      <Link
        href="/billing"
        className="hidden items-center gap-2 rounded-lg border border-propnex-border bg-propnex-panel px-3 py-1.5 text-sm transition-colors hover:border-propnex-accent/50 sm:flex"
        title="Money spent this billing cycle"
      >
        <IndianRupee className="size-4 shrink-0 text-propnex-muted" />
        <span className="text-propnex-muted">Spent</span>
        <span className="font-semibold text-foreground">
          {formatInr(moneyUsedInr)}
        </span>
      </Link>

      <Link
        href="/billing"
        className="flex items-center gap-2 rounded-lg border border-propnex-border bg-propnex-panel px-3 py-1.5 text-sm transition-colors hover:border-propnex-accent/50"
        title="Remaining credits this billing cycle"
      >
        <Coins className="size-4 shrink-0 text-propnex-accent" />
        <span className="hidden text-propnex-muted sm:inline">Credits</span>
        <span className="font-semibold text-foreground">
          {remainingCredits.toLocaleString()}
        </span>
      </Link>
    </header>
  );
}
