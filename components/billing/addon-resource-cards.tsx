import { Clock, Headphones, HardDrive, Puzzle } from "lucide-react";

import { ADDON_RESOURCES } from "@/lib/billing-resources-data";

const ADDON_ICONS = {
  "addon-recording": HardDrive,
  "addon-support": Headphones,
  "addon-infra": Clock,
  "addon-integrations": Puzzle,
} as const;

export function AddonResourceCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ADDON_RESOURCES.map((addon) => {
        const Icon =
          ADDON_ICONS[addon.id as keyof typeof ADDON_ICONS] ?? Puzzle;

        return (
          <div
            key={addon.id}
            className="relative rounded-xl border border-propnex-border bg-propnex-panel/50 p-4 opacity-60"
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-propnex-muted" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {addon.name}
                  </h4>
                  <span className="rounded-md bg-propnex-muted/15 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-propnex-muted uppercase">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-1 text-xs text-propnex-muted">
                  {addon.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
