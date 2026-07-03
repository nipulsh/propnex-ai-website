import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { NavBackLink as NavBackLinkConfig } from "@/lib/navigation";

type NavBackLinkProps = NavBackLinkConfig;

export function NavBackLink({ href, label }: NavBackLinkProps) {
  return (
    <Button
      nativeButton={false}
      render={<Link href={href} aria-label={label} />}
      variant="ghost"
      size="sm"
      className="gap-1.5 text-propnex-muted hover:text-foreground"
    >
      <ArrowLeft className="size-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
