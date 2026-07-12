"use client";

import { ArrowDownLeft, CheckCircle2, Server } from "lucide-react";

import { FilterSelectField } from "@/components/call-logs/filter-select-field";
import {
  DIRECTION_FILTER_OPTIONS,
  PROVIDER_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/lib/phone-numbers-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

export function PhoneNumbersFilters() {
  const direction = usePhoneNumbersStore((state) => state.direction);
  const status = usePhoneNumbersStore((state) => state.status);
  const provider = usePhoneNumbersStore((state) => state.provider);
  const setDirection = usePhoneNumbersStore((state) => state.setDirection);
  const setStatus = usePhoneNumbersStore((state) => state.setStatus);
  const setProvider = usePhoneNumbersStore((state) => state.setProvider);

  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <FilterSelectField
          id="phone-numbers-direction"
          label="Direction"
          icon={ArrowDownLeft}
          value={direction}
          onChange={(value) =>
            setDirection(value as typeof direction)
          }
          options={DIRECTION_FILTER_OPTIONS}
        />

        <FilterSelectField
          id="phone-numbers-status"
          label="Status"
          icon={CheckCircle2}
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={STATUS_FILTER_OPTIONS}
        />

        <FilterSelectField
          id="phone-numbers-provider"
          label="Provider"
          icon={Server}
          value={provider}
          onChange={(value) => setProvider(value as typeof provider)}
          options={PROVIDER_FILTER_OPTIONS}
        />
      </div>
    </section>
  );
}
