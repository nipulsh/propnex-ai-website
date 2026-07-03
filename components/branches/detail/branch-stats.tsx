"use client";

import { FileText, PhoneCall, Users } from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import type { BranchNode } from "@/lib/graphql/queries";
import { cn } from "@/lib/utils";

type TabKey = "contacts" | "call-logs" | "documents" | "activity";

type BranchStatsProps = {
  branch: BranchNode;
  onTabSelect?: (tab: TabKey) => void;
};

export function BranchStats({ branch, onTabSelect }: BranchStatsProps) {
  const cards: {
    title: string;
    value: string;
    icon: typeof Users;
    tab?: TabKey;
  }[] = [
    {
      title: "Contacts",
      value: branch.contactsCount.toLocaleString(),
      icon: Users,
      tab: "contacts",
    },
    {
      title: "Call Logs",
      value: branch.callLogsCount.toLocaleString(),
      icon: PhoneCall,
      tab: "call-logs",
    },
    {
      title: "Documents",
      value: branch.documentsCount.toLocaleString(),
      icon: FileText,
      tab: "documents",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <button
          key={card.title}
          type="button"
          disabled={!onTabSelect || !card.tab}
          onClick={() => card.tab && onTabSelect?.(card.tab)}
          className={cn(
            "text-left",
            onTabSelect && card.tab && "cursor-pointer transition-opacity hover:opacity-90",
          )}
        >
          <StatCard title={card.title} value={card.value} icon={card.icon} />
        </button>
      ))}
    </div>
  );
}
