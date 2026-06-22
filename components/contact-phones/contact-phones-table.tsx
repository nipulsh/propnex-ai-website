"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPhoneDisplay } from "@/lib/phone-numbers-data";
import type { ContactPhone } from "@/stores/contact-phones-store";
import { useContactPhonesStore } from "@/stores/contact-phones-store";
import { cn } from "@/lib/utils";

type ContactPhonesTableProps = {
  contacts: ContactPhone[];
  onDelete: (contact: ContactPhone) => void;
};

export function ContactPhonesTable({
  contacts,
  onDelete,
}: ContactPhonesTableProps) {
  const selectedIds = useContactPhonesStore((s) => s.selectedIds);
  const toggleSelect = useContactPhonesStore((s) => s.toggleSelect);
  const selectAll = useContactPhonesStore((s) => s.selectAll);

  const visibleIds = contacts.map((contact) => contact.id);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;

  return (
    <div className="flex min-h-full flex-col overflow-x-auto">
      <table className="w-full min-w-[480px] flex-1 text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="w-12 px-5 py-3 font-medium">
              <input
                type="checkbox"
                className="size-4 rounded border-propnex-border accent-propnex-accent"
                checked={allVisibleSelected}
                ref={(element) => {
                  if (element) {
                    element.indeterminate = someVisibleSelected;
                  }
                }}
                onChange={() => selectAll(visibleIds)}
                aria-label="Select all on this page"
              />
            </th>
            <th className="px-5 py-3 font-medium">Mobile Number</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-5 py-24 text-center text-propnex-muted"
              >
                <div className="flex min-h-[40vh] items-center justify-center">
                  No phone numbers yet. Add a number or upload a CSV to get
                  started.
                </div>
              </td>
            </tr>
          ) : (
            contacts.map((contact) => {
              const isChecked = selectedIds.includes(contact.id);
              return (
                <tr
                  key={contact.id}
                  className={cn(
                    "border-b border-propnex-border/70 last:border-b-0",
                    isChecked && "bg-propnex-accent/5",
                  )}
                >
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-propnex-border accent-propnex-accent"
                      checked={isChecked}
                      onChange={() => toggleSelect(contact.id)}
                      aria-label={`Select ${contact.phone}`}
                    />
                  </td>
                  <td className="px-5 py-3 font-mono font-medium text-foreground">
                    {formatPhoneDisplay(contact.phone)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(contact)}
                      className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
