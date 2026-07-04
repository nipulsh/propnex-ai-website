"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Phone, Search, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import {
  useSideNotification,
  type SideNotificationType,
} from "@/components/common/side-notification";
import { AddContactDialog } from "@/components/contact-phones/add-contact-dialog";
import { AddContactPhoneDialog } from "@/components/contact-phones/add-contact-phone-dialog";
import { ContactPhonesBulkBar } from "@/components/contact-phones/contact-phones-bulk-bar";
import { ContactPhonesTable } from "@/components/contact-phones/contact-phones-table";
import { DeleteContactPhoneDialog } from "@/components/contact-phones/delete-contact-phone-dialog";
import {
  UploadContactPhonesButtons,
  useUploadContactPhones,
} from "@/components/contact-phones/upload-contact-phones-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContactPhonesGraphQL } from "@/hooks/use-contact-phones-graphql";
import { usePageStatusNotification } from "@/hooks/use-page-status-notification";
import {
  bulkDeleteUploadedContacts,
  deleteUploadedContact,
} from "@/lib/graphql/api";
import {
  CONTACT_PHONES_PAGE_SIZE,
  useContactPhonesStore,
  type ContactPhone,
} from "@/stores/contact-phones-store";

const UPLOADING_NOTIFICATION_ID = "contact-phones-uploading";

export function ContactPhonesPageContent() {
  const { reload } = useContactPhonesGraphQL();
  const upload = useUploadContactPhones(() => void reload());
  const { notify, dismiss } = useSideNotification();

  const contacts = useContactPhonesStore((s) => s.contacts);
  const isLoading = useContactPhonesStore((s) => s.isLoading);
  const error = useContactPhonesStore((s) => s.error);
  const currentPage = useContactPhonesStore((s) => s.currentPage);
  const setPage = useContactPhonesStore((s) => s.setPage);
  const selectedIds = useContactPhonesStore((s) => s.selectedIds);
  const clearSelection = useContactPhonesStore((s) => s.clearSelection);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactPhone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addNumberOpen, setAddNumberOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lastUploadErrorRef = useRef<string | null>(null);
  const lastUploadResultsKeyRef = useRef<string | null>(null);

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading phone numbers…",
    loadingId: "contact-phones-loading",
    error: error ?? undefined,
    onErrorClear: () => useContactPhonesStore.setState({ error: null }),
  });

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return contacts;

    return contacts.filter((contact) =>
      [contact.name, contact.email, contact.address, contact.phone]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query)),
    );
  }, [contacts, searchQuery]);

  const { pageContacts, totalPages, totalCount } = useMemo(() => {
    const total = filteredContacts.length;
    const pages = Math.max(1, Math.ceil(total / CONTACT_PHONES_PAGE_SIZE));
    const safePage = Math.min(currentPage, pages);
    const start = (safePage - 1) * CONTACT_PHONES_PAGE_SIZE;

    return {
      pageContacts: filteredContacts.slice(
        start,
        start + CONTACT_PHONES_PAGE_SIZE,
      ),
      totalPages: pages,
      totalCount: total,
    };
  }, [filteredContacts, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, setPage]);

  useEffect(() => {
    if (upload.isProcessing) {
      lastUploadErrorRef.current = null;
      notify({
        id: UPLOADING_NOTIFICATION_ID,
        type: "info",
        message: "Importing phone numbers…",
      });
      return;
    }

    dismiss(UPLOADING_NOTIFICATION_ID);
  }, [upload.isProcessing, notify, dismiss]);

  useEffect(() => {
    if (!upload.error) {
      lastUploadErrorRef.current = null;
      return;
    }

    if (upload.error === lastUploadErrorRef.current) {
      return;
    }

    lastUploadErrorRef.current = upload.error;
    notify({
      type: "error",
      message: upload.error,
    });
  }, [upload.error, notify]);

  useEffect(() => {
    if (!upload.results || upload.isProcessing) {
      if (!upload.results) {
        lastUploadResultsKeyRef.current = null;
      }
      return;
    }

    const resultsKey = `${upload.results.created}-${upload.results.skipped}-${upload.results.invalid}`;
    if (resultsKey === lastUploadResultsKeyRef.current) {
      return;
    }

    lastUploadResultsKeyRef.current = resultsKey;

    const skippedText =
      upload.results.skipped > 0
        ? `${upload.results.skipped} duplicate${upload.results.skipped !== 1 ? "s" : ""} skipped. `
        : "";
    const invalidText =
      upload.results.invalid > 0
        ? `${upload.results.invalid} invalid row${upload.results.invalid !== 1 ? "s" : ""} skipped.`
        : "";

    notify({
      type: "success",
      message: `${upload.results.created} number${upload.results.created !== 1 ? "s" : ""} added. ${skippedText}${invalidText}`.trim(),
      duration: 5000,
    });
  }, [upload.results, upload.isProcessing, notify]);

  function handleNotify(message: string, type: SideNotificationType) {
    notify({ type, message });
  }

  function openSingleDelete(contact: ContactPhone) {
    setDeleteTarget(contact);
    setDeleteDialogOpen(true);
  }

  function openBulkDelete() {
    setDeleteTarget(null);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      if (deleteTarget) {
        await deleteUploadedContact(deleteTarget.id);
      } else {
        await bulkDeleteUploadedContacts(selectedIds);
      }
      clearSelection();
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      useContactPhonesStore.setState({
        error:
          err instanceof Error
            ? err.message
            : "Unable to delete selected contacts.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const deleteCount = deleteTarget ? 1 : selectedIds.length;
  const deletePhoneLabel = deleteTarget ? deleteTarget.phone : undefined;

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-6">
      <div className="shrink-0">
        <PageHeader
          title="Phone Numbers"
          description="Upload and manage contact mobile numbers from CSV, Excel, PDF, or Word files."
        />
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts by name, email, phone, or address..."
            className="h-11 border-propnex-border bg-propnex-panel pl-10"
          />
        </div>
        <Button
          type="button"
          onClick={() => setAddContactOpen(true)}
          className="h-11 shrink-0 gap-2 sm:w-auto"
        >
          <UserPlus className="size-4" />
          Add Contact
        </Button>
      </div>

      <div className="shrink-0 rounded-lg border border-propnex-border bg-propnex-panel px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAddNumberOpen(true)}
            className="h-9 gap-2 border-propnex-border bg-propnex-panel text-foreground"
          >
            <Phone className="size-4" />
            Add Number
          </Button>
          <UploadContactPhonesButtons upload={upload} />
        </div>
      </div>

      <div className="shrink-0">
        <ContactPhonesBulkBar onDeleteSelected={openBulkDelete} />
      </div>

      <div className="shrink-0 overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
        <ContactPhonesTable
          contacts={pageContacts}
          onDelete={openSingleDelete}
          emptyMessage={
            searchQuery.trim() ? "No contacts match your search." : undefined
          }
        />
        {totalCount > CONTACT_PHONES_PAGE_SIZE ? (
          <div className="flex shrink-0 items-center justify-between border-t border-propnex-border px-5 py-3">
            <p className="text-sm text-propnex-muted">
              {totalCount} contact{totalCount !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                className="h-8 border-propnex-border"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-propnex-muted">
                Page {Math.min(currentPage, totalPages)} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="h-8 border-propnex-border"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <DeleteContactPhoneDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        count={deleteCount}
        phoneLabel={deletePhoneLabel}
        onConfirm={() => void handleConfirmDelete()}
        isDeleting={isDeleting}
      />

      <AddContactDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        onAdded={() => {
          handleNotify("Contact added.", "success");
          void reload();
        }}
      />

      <AddContactPhoneDialog
        open={addNumberOpen}
        onOpenChange={setAddNumberOpen}
        onAdded={() => {
          handleNotify("Phone number added.", "success");
          void reload();
        }}
      />
    </div>
  );
}
