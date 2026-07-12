"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { AssignAgentDialog } from "@/components/phone-numbers/assign-agent-dialog";
import { Button } from "@/components/ui/button";
import type { PhoneNumber } from "@/lib/phone-numbers-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { cn } from "@/lib/utils";

type PhoneNumberActionsMenuProps = {
  entry: PhoneNumber;
  onActionClick?: (event: React.MouseEvent) => void;
};

export function PhoneNumberActionsMenu({
  entry,
  onActionClick,
}: PhoneNumberActionsMenuProps) {
  const setNumberStatus = usePhoneNumbersStore((s) => s.setNumberStatus);
  const [menuOpen, setMenuOpen] = useState(false);
  const [assignDirection, setAssignDirection] = useState<
    "inbound" | "outbound" | null
  >(null);

  const isDisabled = entry.status === "disabled";

  function stopPropagation(event: React.MouseEvent) {
    event.stopPropagation();
    onActionClick?.(event);
  }

  function openAssign(direction: "inbound" | "outbound") {
    setAssignDirection(direction);
    setMenuOpen(false);
  }

  return (
    <div className="relative" onClick={stopPropagation}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-propnex-muted hover:text-foreground"
        onClick={(event) => {
          stopPropagation(event);
          setMenuOpen((open) => !open);
        }}
        aria-label="Number actions"
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className={cn(
              "absolute top-full right-0 z-20 mt-1 min-w-[200px] rounded-lg border border-propnex-border bg-propnex-panel py-1 shadow-lg",
            )}
          >
            <Link
              href={`/phone-numbers/${entry.id}`}
              className="block px-3 py-2 text-sm text-foreground hover:bg-propnex-accent/10"
              onClick={() => setMenuOpen(false)}
            >
              View Details
            </Link>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-propnex-accent/10 disabled:opacity-50"
              disabled={isDisabled}
              onClick={() => openAssign("inbound")}
            >
              Change Inbound Agent
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-propnex-accent/10 disabled:opacity-50"
              disabled={isDisabled}
              onClick={() => openAssign("outbound")}
            >
              Change Outbound Agent
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-propnex-accent/10"
              onClick={() => {
                setNumberStatus(
                  entry.id,
                  isDisabled ? "active" : "disabled",
                );
                setMenuOpen(false);
              }}
            >
              {isDisabled ? "Enable Number" : "Disable Number"}
            </button>
          </div>
        </>
      ) : null}

      {assignDirection ? (
        <AssignAgentDialog
          open
          onOpenChange={(open) => {
            if (!open) setAssignDirection(null);
          }}
          phoneNumberId={entry.id}
          direction={assignDirection}
          currentAgentId={
            assignDirection === "inbound"
              ? entry.inboundAgentId
              : entry.outboundAgentId
          }
        />
      ) : null}
    </div>
  );
}
