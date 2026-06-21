"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { BillingBanner } from "@/components/billing/billing-banner";
import { AddContactPhoneForm } from "@/components/contact-phones/add-contact-phone-form";
import { ContactPhonesBulkBar } from "@/components/contact-phones/contact-phones-bulk-bar";
import { ContactPhonesTable } from "@/components/contact-phones/contact-phones-table";
import { DeleteContactPhoneDialog } from "@/components/contact-phones/delete-contact-phone-dialog";
import {
  UploadContactPhonesButtons,
  UploadContactPhonesFeedback,
  useUploadContactPhones,
} from "@/components/contact-phones/upload-contact-phones-section";
import { Button } from "@/components/ui/button";
import { useContactPhonesGraphQL } from "@/hooks/use-contact-phones-graphql";
import {
  bulkDeleteUploadedContacts,
  deleteUploadedContact,
} from "@/lib/graphql/api";
import {
  CONTACT_PHONES_PAGE_SIZE,
  useContactPhonesStore,
  type ContactPhone,
} from "@/stores/contact-phones-store";

export function ContactPhonesPageContent() {
  const { reload } = useContactPhonesGraphQL();
  const upload = useUploadContactPhones(() => void reload());

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
  const deletePhoneLabel = deleteTarget
    ? deleteTarget.phone
    : undefined;

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Phone Numbers"
          description="Upload and manage contact mobile numbers for outreach."
        />

        <div className="flex flex-col gap-4 rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-sm font-medium text-foreground">
                Add phone number
              </p>
              <AddContactPhoneForm onAdded={() => void reload()} />
            </div>
            <div className="flex flex-wrap gap-3">
              <UploadContactPhonesButtons upload={upload} />
            </div>
          </div>
          <UploadContactPhonesFeedback upload={upload} />
        </div>
      </div>

      {error ? <BillingBanner type="error" message={error} /> : null}
      {isLoading ? (
        <BillingBanner type="info" message="Loading phone numbers…" />
      ) : null}

      <ContactPhonesBulkBar onDeleteSelected={openBulkDelete} />

      <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
        <ContactPhonesTable
          contacts={pageContacts}
          onDelete={openSingleDelete}
        />
        {totalCount > CONTACT_PHONES_PAGE_SIZE ? (
          <div className="flex items-center justify-between border-t border-propnex-border px-5 py-3">
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
