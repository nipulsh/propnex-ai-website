"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";

import {
  fetchBranchAgents,
  fetchBranchCallLogs,
  fetchBranchContacts,
  fetchBranchDocuments,
  updateAgent,
} from "@/lib/graphql/api";
import type {
  BranchAgentNode,
  BranchCallLogNode,
  BranchContactNode,
  BranchDocumentNode,
} from "@/lib/graphql/queries";

type Kind = "contacts" | "call-logs" | "documents" | "agents";

type BranchRelatedTabProps = {
  branchId: string;
  kind: Kind;
  onNotify?: (message: string, type: "success" | "error") => void;
  onAgentsChanged?: () => void;
  refreshKey?: number;
};

const EMPTY_LABEL: Record<Kind, string> = {
  contacts: "No contacts are associated with this branch yet.",
  "call-logs": "No calls have been recorded for this branch yet.",
  documents: "No documents have been uploaded for this branch yet.",
  agents: "No agents are assigned to this branch yet.",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function BranchRelatedTab({
  branchId,
  kind,
  onNotify,
  onAgentsChanged,
  refreshKey,
}: BranchRelatedTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<BranchContactNode[]>([]);
  const [callLogs, setCallLogs] = useState<BranchCallLogNode[]>([]);
  const [documents, setDocuments] = useState<BranchDocumentNode[]>([]);
  const [agents, setAgents] = useState<BranchAgentNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (kind === "contacts") {
        const res = await fetchBranchContacts(branchId);
        setContacts(res.branches.contacts);
      } else if (kind === "call-logs") {
        const res = await fetchBranchCallLogs(branchId);
        setCallLogs(res.branches.callLogs);
      } else if (kind === "documents") {
        const res = await fetchBranchDocuments(branchId);
        setDocuments(res.branches.documents);
      } else {
        const res = await fetchBranchAgents(branchId);
        setAgents(res.branches.agents);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setIsLoading(false);
    }
  }, [branchId, kind]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function handleUnassign(agent: BranchAgentNode) {
    setUnassigningId(agent.id);
    try {
      await updateAgent(agent.id, { branchId: null });
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      onNotify?.(`${agent.name} removed from this branch.`, "success");
      onAgentsChanged?.();
    } catch (err) {
      onNotify?.(
        err instanceof Error ? err.message : "Unable to unassign agent.",
        "error",
      );
    } finally {
      setUnassigningId(null);
    }
  }

  const isEmpty =
    (kind === "contacts" && contacts.length === 0) ||
    (kind === "call-logs" && callLogs.length === 0) ||
    (kind === "documents" && documents.length === 0) ||
    (kind === "agents" && agents.length === 0);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-8 text-center text-sm text-propnex-muted">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-propnex-panel p-8 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-10 text-center text-sm text-propnex-muted">
        {EMPTY_LABEL[kind]}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
      <div className="propnex-scrollbar overflow-x-auto">
        {kind === "contacts" ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-propnex-border text-left text-[0.7rem] tracking-[0.08em] text-propnex-muted uppercase">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Temperature</th>
                <th className="px-4 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-propnex-border/60 hover:bg-propnex-bg/50"
                >
                  <td className="px-4 py-3 text-foreground">
                    {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-propnex-muted">
                    {c.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-propnex-muted">
                    {c.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-propnex-muted">
                    {c.temperature ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-propnex-muted">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {kind === "call-logs" ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-propnex-border text-left text-[0.7rem] tracking-[0.08em] text-propnex-muted uppercase">
                <th className="px-4 py-3 font-medium">Direction</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {callLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-propnex-border/60 hover:bg-propnex-bg/50"
                >
                  <td className="px-4 py-3 text-foreground">{log.direction}</td>
                  <td className="px-4 py-3 text-propnex-muted">{log.status}</td>
                  <td className="px-4 py-3 text-propnex-muted">
                    {formatDuration(log.durationSeconds)}
                  </td>
                  <td className="px-4 py-3 text-propnex-muted">
                    {formatDate(log.startedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {kind === "documents" ? (
          <ul className="divide-y divide-propnex-border/60">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary hover:underline"
                >
                  <FileText className="size-4 text-propnex-muted" />
                  {doc.name}
                </a>
                <span className="text-xs text-propnex-muted">
                  {formatDate(doc.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {kind === "agents" ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-propnex-border text-left text-[0.7rem] tracking-[0.08em] text-propnex-muted uppercase">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Enabled</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-propnex-border/60 hover:bg-propnex-bg/50"
                >
                  <td className="px-4 py-3 text-foreground">{agent.name}</td>
                  <td className="px-4 py-3 text-propnex-muted">{agent.type}</td>
                  <td className="px-4 py-3 text-propnex-muted">{agent.status}</td>
                  <td className="px-4 py-3 text-propnex-muted">
                    {agent.enabled ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-propnex-muted">
                    {formatDate(agent.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void handleUnassign(agent)}
                      disabled={unassigningId === agent.id}
                      className="text-xs font-medium text-destructive hover:underline disabled:opacity-50"
                    >
                      {unassigningId === agent.id ? "Removing…" : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
