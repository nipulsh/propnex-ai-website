"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronDown, XIcon } from "lucide-react";

import { PhoneNumberStatusBadge } from "@/components/phone-numbers/phone-number-status-badge";
import { SetupSection } from "@/components/setup/setup-section";
import { Button } from "@/components/ui/button";
import { formatPhoneDisplay } from "@/lib/phone-numbers-data";
import { PROVIDER_LABELS } from "@/lib/setup-data";
import { cn } from "@/lib/utils";
import { useAgentsStore } from "@/stores/agents-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { useSetupStore } from "@/stores/setup-store";

export function VirtualNumbersSection() {
  const agents = useAgentsStore((state) => state.agents);
  const numbers = usePhoneNumbersStore((state) => state.numbers);
  const setNumberStatus = usePhoneNumbersStore((state) => state.setNumberStatus);
  const assignAgent = useSetupStore((state) => state.assignAgent);
  const unassignAgent = useSetupStore((state) => state.unassignAgent);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedNumberId, setSelectedNumberId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id ?? "");

  function openAssignDialog(id: string, currentAgentId: string) {
    setSelectedNumberId(id);
    setSelectedAgentId(currentAgentId || agents[0]?.id || "");
    setAssignDialogOpen(true);
  }

  function handleAssign() {
    if (!selectedNumberId || !selectedAgentId) {
      return;
    }
    assignAgent(selectedNumberId, selectedAgentId);
    setAssignDialogOpen(false);
  }

  return (
    <SetupSection
      title="Virtual Number Management"
      description="Manage numbers assigned to your account. Numbers are provisioned separately."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
                <th className="px-5 py-3 font-medium">Phone Number</th>
                <th className="px-5 py-3 font-medium">Provider</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Inbound Agent</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {numbers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-propnex-muted"
                  >
                    No numbers assigned to this account. Numbers are provisioned
                    separately.
                  </td>
                </tr>
              ) : (
                numbers.map((entry) => {
                  const isDisabled = entry.status === "disabled";

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-propnex-border last:border-b-0"
                    >
                      <td className="px-5 py-4 font-mono text-foreground">
                        {formatPhoneDisplay(entry.number)}
                      </td>
                      <td className="px-5 py-4 text-propnex-muted">
                        {PROVIDER_LABELS[entry.provider]}
                      </td>
                      <td className="px-5 py-4">
                        <PhoneNumberStatusBadge status={entry.status} />
                      </td>
                      <td className="px-5 py-4 text-foreground">
                        {entry.inboundAgentName === "Unassigned" ||
                        !entry.inboundAgentName
                          ? "Unassigned"
                          : entry.inboundAgentName}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDisabled}
                            onClick={() =>
                              openAssignDialog(entry.id, entry.inboundAgentId)
                            }
                            className="h-8 border-propnex-border bg-propnex-bg text-xs"
                          >
                            Assign Agent
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              isDisabled ||
                              entry.inboundAgentName === "Unassigned"
                            }
                            onClick={() => unassignAgent(entry.id)}
                            className="h-8 border-propnex-border bg-propnex-bg text-xs"
                          >
                            Unassign Agent
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setNumberStatus(
                                entry.id,
                                isDisabled ? "active" : "disabled",
                              )
                            }
                            className="h-8 border-propnex-border bg-propnex-bg text-xs"
                          >
                            {isDisabled ? "Enable Number" : "Disable Number"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DialogPrimitive.Root
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
          <DialogPrimitive.Popup
            className={cn(
              "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
              "rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg",
              "transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
            )}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                  Assign Inbound Agent
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                  Select an AI voice agent for inbound calls on this number.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-propnex-muted"
                  />
                }
              >
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="assign-agent-select"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Agent
              </label>
              <div className="relative">
                <select
                  id="assign-agent-select"
                  value={selectedAgentId}
                  onChange={(event) => setSelectedAgentId(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg py-2 pr-10 pl-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                className="h-11 flex-1 border-propnex-border bg-propnex-bg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAssign}
                className="h-11 flex-1"
              >
                Assign
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </SetupSection>
  );
}
