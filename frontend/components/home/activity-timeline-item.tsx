import Link from "next/link";
import {
  Bot,
  Calendar,
  CreditCard,
  Megaphone,
  Phone,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { ActivityItem, ActivityType } from "@/lib/home-dashboard-data";
import { formatRelativeTime } from "@/lib/home-dashboard-data";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  "agent-created": Bot,
  "campaign-started": Megaphone,
  "call-completed": Phone,
  "lead-converted": Sparkles,
  "demo-scheduled": Calendar,
  "resource-purchased": ShoppingBag,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  "agent-created": "text-propnex-accent bg-propnex-accent/10",
  "campaign-started": "text-orange-400 bg-orange-400/10",
  "call-completed": "text-cyan-400 bg-cyan-400/10",
  "lead-converted": "text-success bg-success/10",
  "demo-scheduled": "text-propnex-accent bg-propnex-accent/10",
  "resource-purchased": "text-propnex-muted bg-propnex-muted/10",
};

type ActivityTimelineItemProps = {
  item: ActivityItem;
};

export function ActivityTimelineItem({ item }: ActivityTimelineItemProps) {
  const Icon = ACTIVITY_ICONS[item.type];
  const colorClass = ACTIVITY_COLORS[item.type];

  const content = (
    <div className="flex gap-3">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          colorClass,
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <time className="shrink-0 text-xs text-propnex-muted">
            {formatRelativeTime(item.timestamp)}
          </time>
        </div>
        <p className="mt-0.5 text-sm text-propnex-muted">{item.description}</p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block rounded-lg transition-colors hover:bg-propnex-bg/50"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function ActivityIcon({ type }: { type: ActivityType }) {
  const Icon = ACTIVITY_ICONS[type] ?? RefreshCw;
  return <Icon className="size-4" />;
}
