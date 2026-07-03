"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBranch } from "@/lib/graphql/api";
import type { BranchNode } from "@/lib/graphql/queries";

type BranchOverviewTabProps = {
  branch: BranchNode;
  onSaved: () => void;
  onNotify: (message: string, type: "success" | "error") => void;
};

const LABEL_CLASS =
  "text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase";
const FIELD_CLASS =
  "h-10 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted";

export function BranchOverviewTab({
  branch,
  onSaved,
  onNotify,
}: BranchOverviewTabProps) {
  const [name, setName] = useState(branch.name);
  const [address, setAddress] = useState(branch.address ?? "");
  const [phone, setPhone] = useState(branch.phone ?? "");
  const [email, setEmail] = useState(branch.email ?? "");
  const [notes, setNotes] = useState(branch.notes ?? "");
  const [status, setStatus] = useState(branch.status);
  const [isSaving, setIsSaving] = useState(false);

  const customFields = branch.customFields ?? {};
  const customEntries = Object.entries(customFields);

  async function handleSave() {
    if (!name.trim()) {
      onNotify("Branch name is required.", "error");
      return;
    }
    setIsSaving(true);
    try {
      await updateBranch(branch.id, {
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
        status,
      });
      onNotify("Branch updated.", "success");
      onSaved();
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : "Unable to update branch.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5 rounded-xl border border-propnex-border bg-propnex-panel p-6">
      <div className="space-y-2">
        <label htmlFor="ov-name" className={LABEL_CLASS}>
          Branch Name
        </label>
        <Input
          id="ov-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="ov-phone" className={LABEL_CLASS}>
            Phone
          </label>
          <Input
            id="ov-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="ov-email" className={LABEL_CLASS}>
            Email
          </label>
          <Input
            id="ov-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="ov-address" className={LABEL_CLASS}>
          Address
        </label>
        <Input
          id="ov-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="ov-notes" className={LABEL_CLASS}>
          Notes
        </label>
        <textarea
          id="ov-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full resize-y rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-foreground outline-none placeholder:text-propnex-muted focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="ov-status" className={LABEL_CLASS}>
          Status
        </label>
        <select
          id="ov-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as BranchNode["status"])}
          className="h-10 w-48 rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {customEntries.length > 0 ? (
        <div className="space-y-2">
          <p className={LABEL_CLASS}>Custom Fields</p>
          <div className="divide-y divide-propnex-border/60 rounded-lg border border-propnex-border">
            {customEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
              >
                <span className="text-propnex-muted">{key}</span>
                <span className="text-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex justify-end pt-2">
        <Button onClick={() => void handleSave()} disabled={isSaving} className="h-10">
          {isSaving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
