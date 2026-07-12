import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type QuickActionCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  className,
}: QuickActionCardProps) {
  const inner = (
    <>
      <div className="flex size-10 items-center justify-center rounded-lg bg-propnex-accent/10 text-propnex-accent">
        <Icon className="size-5" />
      </div>
      <div className="mt-3 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-propnex-muted">{description}</p>
      </div>
      <ArrowRight className="mt-3 size-4 text-propnex-muted" />
    </>
  );

  const cardClass = cn(
    "flex flex-col rounded-xl border border-propnex-border bg-propnex-panel p-4 transition-colors hover:border-propnex-accent/40 hover:bg-propnex-accent/5",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(cardClass, "text-left")}>
      {inner}
    </button>
  );
}
