import Link from "next/link";
import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BillingHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Billing & Credits
        </h1>
        <p className="mt-1 max-w-xl text-sm text-propnex-muted">
          Manage your workspace&apos;s resource consumption and invoices.
        </p>
      </div>

      <Button
        nativeButton={false}
        render={<Link href="/pricing" />}
        className="h-10 w-full gap-2 px-5 shadow-[0_0_20px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)] sm:w-auto"
      >
        <CreditCard className="size-4" />
        Buy Credits
      </Button>
    </div>
  );
}
