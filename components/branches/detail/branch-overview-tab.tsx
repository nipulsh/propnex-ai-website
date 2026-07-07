import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  updateBranch, 
  resendBranchInvitation, 
  cancelBranchInvitation, 
  generateNewBranchInvitation 
} from "@/lib/graphql/api";
import type { BranchNode } from "@/lib/graphql/queries";
import { cn } from "@/lib/utils";

type BranchOverviewTabProps = {
  branch: BranchNode;
  onSaved: () => void;
  onNotify: (message: string, type: "success" | "error") => void;
};

const LABEL_CLASS =
  "text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase";
const FIELD_CLASS =
  "h-10 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

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
  const [isUpdatingInvite, setIsUpdatingInvite] = useState(false);

  const customFields = branch.customFields ?? {};
  const customEntries = Object.entries(customFields);

  const getInviteStatus = () => {
    if (!branch.invitation) return null;
    if (branch.invitation.status === "PENDING" && new Date(branch.invitation.expiresAt) <= new Date()) {
      return "EXPIRED";
    }
    return branch.invitation.status;
  };

  const inviteStatus = getInviteStatus();

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

  async function handleResendInvite() {
    setIsUpdatingInvite(true);
    try {
      const res = await resendBranchInvitation(branch.id);
      const isSent = res.branches.resendInvitation.invitationEmailSent;
      if (isSent) {
        onNotify("Invitation email resent successfully.", "success");
      } else {
        onNotify("Invitation status updated, but the email could not be delivered.", "error");
      }
      onSaved();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : "Failed to resend invitation.", "error");
    } finally {
      setIsUpdatingInvite(false);
    }
  }

  async function handleCancelInvite() {
    setIsUpdatingInvite(true);
    try {
      await cancelBranchInvitation(branch.id);
      onNotify("Invitation cancelled.", "success");
      onSaved();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : "Failed to cancel invitation.", "error");
    } finally {
      setIsUpdatingInvite(false);
    }
  }

  async function handleGenerateNewInvite() {
    if (branch.invitation) {
      if (!confirm("Are you sure you want to generate a new invitation? This will invalidate the previous invitation link.")) {
        return;
      }
    }
    setIsUpdatingInvite(true);
    try {
      const res = await generateNewBranchInvitation(branch.id);
      const isSent = res.branches.generateNewInvitation.invitationEmailSent;
      if (isSent) {
        onNotify("New invitation generated and email sent.", "success");
      } else {
        onNotify("New invitation generated, but the email could not be delivered.", "error");
      }
      onSaved();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : "Failed to generate new invitation.", "error");
    } finally {
      setIsUpdatingInvite(false);
    }
  }

  function handleCopyInviteLink() {
    if (!branch.invitation?.token) return;
    const invitationLink = `${window.location.origin}/invitations/branch/${branch.invitation.token}`;
    navigator.clipboard.writeText(invitationLink);
    onNotify("Invitation link copied to clipboard.", "success");
  }

  return (
    <div className="space-y-6">
      {/* Branch Details Card */}
      <div className="space-y-5 rounded-xl border border-propnex-border bg-propnex-panel p-6">
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

      {/* Invitation Tracking Card */}
      {branch.email ? (
        <div className="space-y-5 rounded-xl border border-propnex-border bg-propnex-panel p-6">
          <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase border-b border-propnex-border/40 pb-2">
            Invitation Tracking
          </h3>
          
          {branch.invitation ? (
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-propnex-border/30 pb-2">
                  <span className="text-propnex-muted">Invitation Status</span>
                  <span className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                    inviteStatus === "ACCEPTED" && "border-success/30 bg-success/10 text-success",
                    inviteStatus === "PENDING" && "border-warning/30 bg-warning/10 text-warning",
                    inviteStatus === "EXPIRED" && "border-destructive/30 bg-destructive/10 text-destructive",
                    inviteStatus === "CANCELLED" && "border-propnex-border bg-propnex-bg text-propnex-muted",
                  )}>
                    {STATUS_LABELS[inviteStatus || ""] || inviteStatus}
                  </span>
                </div>
                <div className="flex justify-between border-b border-propnex-border/30 pb-2">
                  <span className="text-propnex-muted">Invited Email</span>
                  <span className="font-medium text-foreground">{branch.invitation.email}</span>
                </div>
                <div className="flex justify-between border-b border-propnex-border/30 pb-2">
                  <span className="text-propnex-muted">Invitation Sent Date</span>
                  <span className="font-medium text-foreground">
                    {new Date(branch.invitation.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-propnex-border/30 pb-2">
                  <span className="text-propnex-muted">Last Invitation Sent</span>
                  <span className="font-medium text-foreground">
                    {new Date(branch.invitation.sentAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-propnex-border/30 pb-2">
                  <span className="text-propnex-muted">Invitation Accepted Date</span>
                  <span className="font-medium text-foreground">
                    {branch.invitation.acceptedAt 
                      ? new Date(branch.invitation.acceptedAt).toLocaleString() 
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-propnex-border/30 pb-2">
                  <span className="text-propnex-muted">Expires At</span>
                  <span className="font-medium text-foreground">
                    {new Date(branch.invitation.expiresAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 flex flex-wrap gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteLink}
                  disabled={inviteStatus === "ACCEPTED" || inviteStatus === "CANCELLED"}
                  className="border-propnex-border bg-propnex-bg h-9"
                >
                  Copy Invitation Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCancelInvite()}
                  disabled={inviteStatus === "ACCEPTED" || inviteStatus === "CANCELLED" || isUpdatingInvite}
                  className="border-destructive/30 text-destructive bg-propnex-bg hover:bg-destructive/10 h-9"
                >
                  Cancel Invitation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleResendInvite()}
                  disabled={inviteStatus === "ACCEPTED" || inviteStatus === "CANCELLED" || isUpdatingInvite}
                  className="border-propnex-border bg-propnex-bg h-9"
                >
                  Resend Invitation
                </Button>
                <Button
                  size="sm"
                  onClick={() => void handleGenerateNewInvite()}
                  disabled={isUpdatingInvite}
                  className="h-9"
                >
                  Generate New Invitation
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <p className="text-sm text-propnex-muted mb-4">
                No active invitation link exists for this branch.
              </p>
              <Button
                size="sm"
                onClick={() => void handleGenerateNewInvite()}
                disabled={isUpdatingInvite}
                className="h-9"
              >
                Generate Invitation Link
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6 text-center text-sm text-propnex-muted">
          Configure a Branch Email address above to generate an invitation link.
        </div>
      )}
    </div>
  );
}
