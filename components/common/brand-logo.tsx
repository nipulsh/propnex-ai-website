import { PropnexLogo } from "@/components/common/propnex-logo";
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
  return (
    <PropnexLogo
      variant={showText ? "full" : "compact"}
      className={cn(
        "text-foreground",
        size === "sm" ? "h-6 w-auto" : "h-7 w-auto",
        className,
      )}
    />
  );
}
