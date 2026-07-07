"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Loader2, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { sendInvitation } from "@/actions/employee/send-invitation";
import { useSideNotification } from "@/components/common/side-notification";
import { BranchMultiSelect } from "@/components/employees/branch-multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/use-permissions";
import { fetchBranchesPage } from "@/lib/graphql/api";
import type { UserRole } from "@/lib/graphql/queries";
import { ROLE_LABELS } from "@/lib/permissions";
import {
  inviteEmployeeSchema,
  type InviteEmployeeInput,
} from "@/lib/validations/invite-employee";
import { cn } from "@/lib/utils";

type InviteEmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
};

const LABEL_CLASS =
  "text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase";
const FIELD_CLASS =
  "h-10 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted";

const DEFAULT_VALUES: InviteEmployeeInput = {
  name: "",
  email: "",
  jobTitle: "",
  role: "SALES",
  branchAccessType: "ALL",
  branchIds: [],
};

export function InviteEmployeeDialog({
  open,
  onOpenChange,
  onInvited,
}: InviteEmployeeDialogProps) {
  const { notify } = useSideNotification();
  const { getAssignableRoles } = usePermissions();
  const assignableRoles = getAssignableRoles();
  const roleOptions = assignableRoles.map((value) => ({
    value: value as UserRole,
    label: ROLE_LABELS[value],
  }));
  const defaultRole = (assignableRoles[0] ?? "SALES") as InviteEmployeeInput["role"];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteEmployeeInput>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: { ...DEFAULT_VALUES, role: defaultRole },
  });

  const branchAccessType = watch("branchAccessType");
  const branchIds = watch("branchIds") ?? [];
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    fetchBranchesPage(100)
      .then((res) =>
        setBranches(
          res.branches.connection.edges.map((e) => ({
            id: e.node.id,
            name: e.node.name,
          })),
        ),
      )
      .catch(() => setBranches([]));
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (!next) reset({ ...DEFAULT_VALUES, role: defaultRole });
    onOpenChange(next);
  }

  async function onSubmit(values: InviteEmployeeInput) {
    const result = await sendInvitation(values);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof InviteEmployeeInput, { message });
        }
      }
      setError("root", { message: result.error });
      return;
    }

    notify({ type: "success", message: "Invitation sent." });
    handleOpenChange(false);
    onInvited();
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-xl",
            "data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold">
                Invite Employee
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Send an invitation to join your company workspace.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              className="rounded-md p-1 text-propnex-muted hover:bg-propnex-bg"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className={LABEL_CLASS}>Full name</label>
                <Input
                  {...register("name")}
                  className={FIELD_CLASS}
                  placeholder="Jane Smith"
                  disabled={isSubmitting}
                />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className={LABEL_CLASS}>Email</label>
                <Input
                  type="email"
                  {...register("email")}
                  className={FIELD_CLASS}
                  placeholder="jane@company.com"
                  disabled={isSubmitting}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Job title</label>
                <Input
                  {...register("jobTitle")}
                  className={FIELD_CLASS}
                  placeholder="Sales Executive"
                  disabled={isSubmitting}
                />
                {errors.jobTitle ? (
                  <p className="text-sm text-destructive">
                    {errors.jobTitle.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Role</label>
                <select
                  {...register("role")}
                  className={cn(FIELD_CLASS, "w-full rounded-md border px-3")}
                  disabled={isSubmitting}
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.role ? (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <p className={LABEL_CLASS}>Branch access</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="ALL"
                    checked={branchAccessType === "ALL"}
                    onChange={() => {
                      setValue("branchAccessType", "ALL", { shouldValidate: true });
                      setValue("branchIds", [], { shouldValidate: true });
                    }}
                    disabled={isSubmitting}
                  />
                  All branches
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="SELECTED"
                    checked={branchAccessType === "SELECTED"}
                    onChange={() =>
                      setValue("branchAccessType", "SELECTED", {
                        shouldValidate: true,
                      })
                    }
                    disabled={isSubmitting}
                  />
                  Selected branches
                </label>
              </div>
              {branchAccessType === "SELECTED" ? (
                <BranchMultiSelect
                  branches={branches}
                  value={branchIds}
                  onChange={(ids) =>
                    setValue("branchIds", ids, { shouldValidate: true })
                  }
                  disabled={isSubmitting}
                  error={errors.branchIds?.message}
                />
              ) : null}
            </div>

            {errors.root ? (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send invitation"
                )}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
