import { Calendar, Hash, Server } from "lucide-react";

import { SubscriptionStatusBadge } from "@/components/billing/subscription-status-badge";
import {
  activeSubscriptions,
  formatResourceDate,
} from "@/lib/billing-resources-data";
import { getDaysRemaining } from "@/lib/billing-pricing";
import { BILLING_PRICING } from "@/lib/billing-pricing";

export function ResourceValiditySection() {
  if (activeSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeSubscriptions.map((sub) => {
        const daysRemaining = getDaysRemaining(sub.expiresOn);
        const Icon = sub.resourceType === "channels" ? Server : Hash;

        return (
          <div
            key={sub.id}
            className="rounded-xl border border-propnex-border bg-propnex-panel p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon className="size-5 text-propnex-accent" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {sub.resourceType === "channels"
                      ? "Channels"
                      : "Virtual Numbers"}{" "}
                    Purchased: {sub.quantity}
                  </h3>
                  {sub.resourceType === "channels" ? (
                    <p className="mt-0.5 text-xs text-propnex-muted">
                      Validity: {BILLING_PRICING.channels.validityMonths} months
                    </p>
                  ) : null}
                </div>
              </div>
              <SubscriptionStatusBadge status={sub.status} />
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-1 text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                  <Calendar className="size-3" />
                  Purchased On
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {formatResourceDate(sub.purchasedOn)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                  <Calendar className="size-3" />
                  Expires On
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {formatResourceDate(sub.expiresOn)}
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                  Days Remaining
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {sub.status === "expired"
                    ? "Expired"
                    : `${daysRemaining} Days`}
                </dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}
