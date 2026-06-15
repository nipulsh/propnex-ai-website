"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  IntelligenceItemDialog,
  type IntelligenceDialogMode,
} from "@/components/agents/common/intelligence-item-dialog";
import { DetailSection } from "@/components/call-details/detail-section";
import { Button } from "@/components/ui/button";
import type {
  Agent,
  Monitor,
  Scorecard,
  StructuredOutputField,
} from "@/lib/agents-data";
import { useAgentsStore } from "@/stores/agents-store";

type AgentIntelligenceSectionProps = {
  agent: Agent;
};

export function AgentIntelligenceSection({
  agent,
}: AgentIntelligenceSectionProps) {
  const updateAgent = useAgentsStore((s) => s.updateAgent);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] =
    useState<IntelligenceDialogMode>("structured-output");
  const [editId, setEditId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Record<string, string>>(
    {},
  );

  function openAdd(mode: IntelligenceDialogMode) {
    setDialogMode(mode);
    setEditId(null);
    setInitialValues({});
    setDialogOpen(true);
  }

  function openEdit(
    mode: IntelligenceDialogMode,
    id: string,
    values: Record<string, string>,
  ) {
    setDialogMode(mode);
    setEditId(id);
    setInitialValues(values);
    setDialogOpen(true);
  }

  function handleSave(values: Record<string, string>) {
    if (dialogMode === "structured-output") {
      const field: StructuredOutputField = {
        id: editId ?? `so-${Date.now()}`,
        name: values.name ?? "",
        description: values.description ?? "",
        type: (values.type as StructuredOutputField["type"]) ?? "text",
        required: false,
      };
      const list = editId
        ? agent.structuredOutputs.map((f) =>
            f.id === editId ? field : f,
          )
        : [...agent.structuredOutputs, field];
      updateAgent(agent.id, { structuredOutputs: list });
    } else if (dialogMode === "scorecard") {
      const card: Scorecard = {
        id: editId ?? `sc-${Date.now()}`,
        name: values.name ?? "",
        criteria: values.criteria ?? "",
        weight: Number(values.weight) || 0,
      };
      const list = editId
        ? agent.scorecards.map((c) => (c.id === editId ? card : c))
        : [...agent.scorecards, card];
      updateAgent(agent.id, { scorecards: list });
    } else {
      const monitor: Monitor = {
        id: editId ?? `mon-${Date.now()}`,
        name: values.name ?? "",
        type:
          (values.type as Monitor["type"]) ?? "quality",
        status: "active",
      };
      const list = editId
        ? agent.monitors.map((m) => (m.id === editId ? monitor : m))
        : [...agent.monitors, monitor];
      updateAgent(agent.id, { monitors: list });
    }
  }

  function removeStructuredOutput(id: string) {
    updateAgent(agent.id, {
      structuredOutputs: agent.structuredOutputs.filter((f) => f.id !== id),
    });
  }

  function removeScorecard(id: string) {
    updateAgent(agent.id, {
      scorecards: agent.scorecards.filter((c) => c.id !== id),
    });
  }

  function removeMonitor(id: string) {
    updateAgent(agent.id, {
      monitors: agent.monitors.filter((m) => m.id !== id),
    });
  }

  return (
    <DetailSection
      id="intelligence"
      title="Analysis & Intelligence"
      description="Structured outputs, scorecards, and monitoring for agent performance."
    >
      <div className="space-y-6">
        <IntelligenceTable
          title="Structured Outputs"
          onAdd={() => openAdd("structured-output")}
          emptyMessage="No structured output fields defined."
          itemCount={agent.structuredOutputs.length}
        >
          {agent.structuredOutputs.map((field) => (
            <tr
              key={field.id}
              className="border-b border-propnex-border/60 last:border-0"
            >
              <td className="px-5 py-3 font-medium text-foreground">
                {field.name}
              </td>
              <td className="px-5 py-3 text-propnex-muted">
                {field.description}
              </td>
              <td className="px-5 py-3 text-propnex-muted">{field.type}</td>
              <td className="px-5 py-3">
                <RowActions
                  onEdit={() =>
                    openEdit("structured-output", field.id, {
                      name: field.name,
                      description: field.description,
                      type: field.type,
                    })
                  }
                  onDelete={() => removeStructuredOutput(field.id)}
                />
              </td>
            </tr>
          ))}
        </IntelligenceTable>

        <IntelligenceTable
          title="Scorecards"
          onAdd={() => openAdd("scorecard")}
          emptyMessage="No scorecards configured."
          headers={["Name", "Criteria", "Weight", ""]}
          itemCount={agent.scorecards.length}
        >
          {agent.scorecards.map((card) => (
            <tr
              key={card.id}
              className="border-b border-propnex-border/60 last:border-0"
            >
              <td className="px-5 py-3 font-medium text-foreground">
                {card.name}
              </td>
              <td className="px-5 py-3 text-propnex-muted">{card.criteria}</td>
              <td className="px-5 py-3 text-foreground">{card.weight}%</td>
              <td className="px-5 py-3">
                <RowActions
                  onEdit={() =>
                    openEdit("scorecard", card.id, {
                      name: card.name,
                      criteria: card.criteria,
                      weight: String(card.weight),
                    })
                  }
                  onDelete={() => removeScorecard(card.id)}
                />
              </td>
            </tr>
          ))}
        </IntelligenceTable>

        <IntelligenceTable
          title="Monitors"
          onAdd={() => openAdd("monitor")}
          emptyMessage="No monitors attached."
          headers={["Name", "Type", "Status", ""]}
          itemCount={agent.monitors.length}
        >
          {agent.monitors.map((monitor) => (
            <tr
              key={monitor.id}
              className="border-b border-propnex-border/60 last:border-0"
            >
              <td className="px-5 py-3 font-medium text-foreground">
                {monitor.name}
              </td>
              <td className="px-5 py-3 capitalize text-propnex-muted">
                {monitor.type.replace("-", " ")}
              </td>
              <td className="px-5 py-3 capitalize text-success">
                {monitor.status}
              </td>
              <td className="px-5 py-3">
                <RowActions
                  onEdit={() =>
                    openEdit("monitor", monitor.id, {
                      name: monitor.name,
                      type: monitor.type,
                    })
                  }
                  onDelete={() => removeMonitor(monitor.id)}
                />
              </td>
            </tr>
          ))}
        </IntelligenceTable>
      </div>

      <IntelligenceItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialValues={initialValues}
        onSave={handleSave}
      />
    </DetailSection>
  );
}

function IntelligenceTable({
  title,
  onAdd,
  emptyMessage,
  headers = ["Name", "Description", "Type", ""],
  itemCount,
  children,
}: {
  title: string;
  onAdd: () => void;
  emptyMessage: string;
  headers?: string[];
  itemCount: number;
  children: React.ReactNode;
}) {
  const hasRows = itemCount > 0;

  return (
    <div className="rounded-xl border border-propnex-border bg-propnex-panel">
      <div className="flex items-center justify-between border-b border-propnex-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="h-8 gap-1.5 border-propnex-border bg-propnex-bg text-xs"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
      {!hasRows ? (
        <p className="px-5 py-8 text-center text-sm text-propnex-muted">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
                {headers.map((h) => (
                  <th key={h} className="px-5 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-md p-1.5 text-propnex-muted hover:bg-propnex-bg hover:text-foreground"
        aria-label="Edit"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md p-1.5 text-propnex-muted hover:bg-destructive/10 hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
