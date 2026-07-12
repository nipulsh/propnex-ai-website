import { AlertTriangle } from "lucide-react";

type ResourceWarningBannerProps = {
  message: string;
};

export function ResourceWarningBanner({ message }: ResourceWarningBannerProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-400/10 px-4 py-3 text-sm text-orange-400"
      role="alert"
    >
      <AlertTriangle className="size-4 shrink-0" />
      {message}
    </div>
  );
}
