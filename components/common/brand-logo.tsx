import { Bot } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md";
};

export function BrandLogo({
  className,
  showText = true,
  size = "md",
}: BrandLogoProps) {
  const iconSize = size === "sm" ? "size-7" : "size-8";
  const botSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary/15 text-primary",
          iconSize,
        )}
      >
        <Bot className={botSize} />
      </div>
      {showText ? (
        <span className="text-sm font-semibold tracking-tight">PropNex AI</span>
      ) : null}
    </div>
  );
}
