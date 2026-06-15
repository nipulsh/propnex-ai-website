"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  filterPhoneNumbers,
  phoneNumbersToCsv,
} from "@/lib/phone-numbers-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { cn } from "@/lib/utils";

type ExportPhoneNumbersButtonProps = {
  className?: string;
  children?: ReactNode;
};

export function ExportPhoneNumbersButton({
  className,
  children,
}: ExportPhoneNumbersButtonProps) {
  const numbers = usePhoneNumbersStore((state) => state.numbers);
  const searchQuery = usePhoneNumbersStore((state) => state.searchQuery);
  const agentId = usePhoneNumbersStore((state) => state.agentId);
  const label = usePhoneNumbersStore((state) => state.label);

  const handleExport = () => {
    const filtered = filterPhoneNumbers(numbers, searchQuery, agentId, label);
    const csv = phoneNumbersToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phone-numbers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      className={cn(className)}
    >
      {children ?? "Export"}
    </Button>
  );
}
