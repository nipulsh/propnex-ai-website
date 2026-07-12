"use client";

import { Download, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { contactsToCsv } from "@/lib/contact-phone-import";
import { useContactPhonesStore } from "@/stores/contact-phones-store";

type ContactPhonesBulkBarProps = {
  onDeleteSelected: () => void;
};

export function ContactPhonesBulkBar({
  onDeleteSelected,
}: ContactPhonesBulkBarProps) {
  const selectedIds = useContactPhonesStore((s) => s.selectedIds);
  const contacts = useContactPhonesStore((s) => s.contacts);

  if (selectedIds.length === 0) {
    return null;
  }

  const selectedContacts = contacts.filter((contact) =>
    selectedIds.includes(contact.id),
  );

  function handleExport() {
    const csv = contactsToCsv(selectedContacts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phone-contacts-selected-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-propnex-accent/30 bg-propnex-accent/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-foreground">
        <span className="font-medium">{selectedIds.length}</span> selected
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          className="h-9 gap-2 border-propnex-border bg-propnex-panel"
        >
          <Download className="size-4" />
          Export Selected
        </Button>
        <Button
          type="button"
          onClick={onDeleteSelected}
          className="h-9 gap-2 bg-destructive text-white hover:bg-destructive/90"
        >
          <Trash2 className="size-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
}
