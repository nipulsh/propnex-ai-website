"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import {
  useSideNotification,
  type SideNotificationType,
} from "@/components/common/side-notification";
import { AddContactPhoneForm } from "@/components/contact-phones/add-contact-phone-form";
import { ContactPhonesBulkBar } from "@/components/contact-phones/contact-phones-bulk-bar";
import { ContactPhonesTable } from "@/components/contact-phones/contact-phones-table";
import { DeleteContactPhoneDialog } from "@/components/contact-phones/delete-contact-phone-dialog";
import {
  UploadContactPhonesButtons,
  useUploadContactPhones,
} from "@/components/contact-phones/upload-contact-phones-section";
import { Button } from "@/components/ui/button";
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

  const lastUploadErrorRef = useRef<string | null>(null);
  const lastUploadResultsKeyRef = useRef<string | null>(null);

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading phone numbers…",
    loadingId: "contact-phones-loading",
    error: error ?? undefined,
    onErrorClear: () => useContactPhonesStore.setState({ error: null }),
  });

  const { pageContacts, totalPages, totalCount } = useMemo(() => {
    const total = contacts.length;
    const pages = Math.max(1, Math.ceil(total / CONTACT_PHONES_PAGE_SIZE));
    const safePage = Math.min(currentPage, pages);
    const start = (safePage - 1) * CONTACT_PHONES_PAGE_SIZE;

    return {
      pageContacts: contacts.slice(start, start + CONTACT_PHONES_PAGE_SIZE),
      totalPages: pages,
      totalCount: total,
    };
  }, [contacts, currentPage]);

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
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-6">
      <div className="shrink-0">
        <PageHeader
          title="Phone Numbers"
          description="Upload and manage contact mobile numbers from CSV, Excel, PDF, or Word files."
        />
      </div>

      <div className="shrink-0 rounded-lg border border-propnex-border bg-propnex-panel px-3 py-2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <AddContactPhoneForm
            onAdded={() => void reload()}
            onNotify={handleNotify}
          />
          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <UploadContactPhonesButtons upload={upload} />
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <ContactPhonesBulkBar onDeleteSelected={openBulkDelete} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
        <div className="propnex-scrollbar min-h-0 flex-1 overflow-y-auto">
          <ContactPhonesTable
            contacts={pageContacts}
            onDelete={openSingleDelete}
          />
        </div>
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
    </div>
  );
}
