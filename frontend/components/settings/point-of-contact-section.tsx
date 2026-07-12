"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useSideNotification } from "@/components/common/side-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/use-permissions";
import { apiFetch } from "@/lib/api/client-fetch";
import { PERMISSIONS } from "@/lib/permissions";
import { useSettingsStore } from "@/stores/settings-store";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  title: string;
};

function buildInitialContact(
  contact: {
    name: string;
    email: string;
    phone: string | null;
    title: string | null;
  } | null,
  fallback: { name: string; email: string },
): ContactForm {
  return {
    name: contact?.name ?? fallback.name,
    email: contact?.email ?? fallback.email,
    phone: contact?.phone ?? "",
    title: contact?.title ?? "",
  };
}

export function PointOfContactSection() {
  const viewer = useSettingsStore((s) => s.viewer);
  const updateCompanyContact = useSettingsStore((s) => s.updateCompanyContact);
  const { notify } = useSideNotification();
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission(PERMISSIONS.SETTINGS_WRITE);
  const fallbackName =
    [viewer?.firstName, viewer?.lastName].filter(Boolean).join(" ") ||
    viewer?.email ||
    "";
  const fallbackEmail = viewer?.email ?? "";

  const [form, setForm] = useState<ContactForm>(() =>
    buildInitialContact(viewer?.company.contact ?? null, {
      name: fallbackName,
      email: fallbackEmail,
    }),
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!viewer) return;
    setForm(
      buildInitialContact(viewer.company.contact, {
        name: fallbackName,
        email: fallbackEmail,
      }),
    );
  }, [viewer, fallbackName, fallbackEmail]);

  async function handleSave() {
    if (!canEdit) return;

    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) {
      notify({ type: "error", message: "Name and email are required." });
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch("/company/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: form.phone.trim() || undefined,
          title: form.title.trim() || undefined,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        contact?: {
          name: string;
          email: string;
          phone: string | null;
          title: string | null;
        };
      };

      if (!response.ok) {
        notify({
          type: "error",
          message: data.error ?? "Failed to save point of contact.",
        });
        return;
      }

      if (data.contact) {
        updateCompanyContact(data.contact);
        setForm({
          name: data.contact.name,
          email: data.contact.email,
          phone: data.contact.phone ?? "",
          title: data.contact.title ?? "",
        });
      }

      notify({
        type: "success",
        message: "Point of contact updated. Changes will appear in your admin overview.",
      });
    } catch {
      notify({ type: "error", message: "Failed to save point of contact." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4 border-t border-propnex-border pt-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Point of contact</h3>
        <p className="mt-1 text-xs text-propnex-muted">
          Primary contact for your company. This is shown in the PropNex admin
          company overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="poc-name" className="text-xs text-propnex-muted">
            Name
          </label>
          <Input
            id="poc-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!canEdit || isSaving}
            placeholder="Full name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="poc-title" className="text-xs text-propnex-muted">
            Title
          </label>
          <Input
            id="poc-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            disabled={!canEdit || isSaving}
            placeholder="e.g. Operations Manager"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="poc-email" className="text-xs text-propnex-muted">
            Email
          </label>
          <Input
            id="poc-email"
            type="email"
            value={form.email}
            readOnly
            disabled
            placeholder="contact@company.com"
          />
          <p className="text-xs text-propnex-muted">
            Set when you linked your Contract ID and cannot be changed.
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="poc-phone" className="text-xs text-propnex-muted">
            Phone
          </label>
          <Input
            id="poc-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={!canEdit || isSaving}
            placeholder="+91XXXXXXXXXX"
          />
        </div>
      </div>

      {canEdit ? (
        <Button onClick={() => void handleSave()} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save point of contact"
          )}
        </Button>
      ) : (
        <p className="text-xs text-propnex-muted">
          Only the workspace owner can update point of contact information.
        </p>
      )}
    </div>
  );
}
