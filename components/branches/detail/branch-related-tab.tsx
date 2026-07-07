"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Search, Settings2, Trash2, Upload } from "lucide-react";

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
import { formatPhoneDisplay } from "@/lib/phone-numbers-data";

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PendingDocument = {
  id: string;
  name: string;
  sizeBytes: number;
  agentId: string;
};

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
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>(
    [],
  );
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
        const [docsRes, agentsRes] = await Promise.all([
          fetchBranchDocuments(branchId),
          fetchBranchAgents(branchId),
        ]);
        setDocuments(docsRes.branches.documents);
        setAgents(agentsRes.branches.agents);
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

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const next = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      sizeBytes: file.size,
      agentId: selectedAgentId,
    }));
    setPendingDocuments((prev) => [...prev, ...next]);
  }

  function handleRemovePendingDocument(id: string) {
    setPendingDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }

  const query = searchQuery.trim().toLowerCase();

  const filteredContacts = useMemo(() => {
    if (!query) return contacts;
    return contacts.filter((c) =>
      [c.firstName, c.lastName, c.email, c.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [contacts, query]);

  const filteredAgents = useMemo(() => {
    if (!query) return agents;
    return agents.filter((a) =>
      [a.name, a.type, a.status]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [agents, query]);

  const filteredCallLogs = useMemo(() => {
    return callLogs.filter((log) => {
      if (directionFilter !== "all" && log.direction !== directionFilter)
        return false;
      if (statusFilter !== "all" && log.status !== statusFilter) return false;
      return true;
    });
  }, [callLogs, directionFilter, statusFilter]);

  const isEmpty =
    (kind === "contacts" && contacts.length === 0) ||
    (kind === "call-logs" && callLogs.length === 0) ||
    (kind === "agents" && agents.length === 0);

  const noFilterResults =
    (query.length > 0 &&
      ((kind === "contacts" && filteredContacts.length === 0) ||
        (kind === "agents" && filteredAgents.length === 0))) ||
    (kind === "call-logs" &&
      callLogs.length > 0 &&
      filteredCallLogs.length === 0);

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

  if (kind === "documents") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="mb-1 text-sm font-medium text-foreground">
            Upload a document
          </h3>
          <p className="mb-4 text-sm text-propnex-muted">
            Choose which agent this document should be used as context for.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="h-10 rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
            >
              <option value="">No specific agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <label
              htmlFor="branch-document-upload"
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-propnex-border bg-propnex-bg px-4 text-sm font-medium text-foreground transition-colors hover:border-propnex-accent"
            >
              <Upload className="size-4 text-propnex-muted" />
              Choose file
            </label>
            <input
              id="branch-document-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                handleFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {pendingDocuments.length > 0 ? (
            <ul className="mt-4 divide-y divide-propnex-border/60 rounded-lg border border-propnex-border">
              {pendingDocuments.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <FileText className="size-4 shrink-0 text-propnex-muted" />
                    {doc.name}
                  </span>
                  <span className="flex items-center gap-3 text-xs text-propnex-muted">
                    {agents.find((a) => a.id === doc.agentId)?.name ??
                      "No agent"}
                    {formatBytes(doc.sizeBytes)}
                    <button
                      type="button"
                      onClick={() => handleRemovePendingDocument(doc.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-3 text-xs text-propnex-muted">
            Document upload isn&rsquo;t wired to storage yet — this is a
            preview of the upload experience.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
          <div className="propnex-scrollbar overflow-x-auto">
            {documents.length > 0 ? (
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
            ) : (
              <div className="p-10 text-center text-sm text-propnex-muted">
                {EMPTY_LABEL.documents}
              </div>
            )}
          </div>
        </div>
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
    <div className="space-y-3">
      {kind === "contacts" || kind === "agents" ? (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-propnex-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              kind === "contacts"
                ? "Search contacts by name, email, or phone…"
                : "Search agents by name, type, or status…"
            }
            className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-panel pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-propnex-muted focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
          />
        </div>
      ) : null}

      {kind === "call-logs" ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="h-10 rounded-lg border border-propnex-border bg-propnex-panel px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
          >
            <option value="all">All Directions</option>
            <option value="INBOUND">Inbound</option>
            <option value="OUTBOUND">Outbound</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-propnex-border bg-propnex-panel px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="MISSED">Missed</option>
            <option value="VOICEMAIL">Voicemail</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      ) : null}

      {noFilterResults ? (
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-10 text-center text-sm text-propnex-muted">
          {kind === "call-logs"
            ? "No calls match the selected filters."
            : `No ${kind} match "${searchQuery.trim()}".`}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
          <div className="propnex-scrollbar overflow-x-auto">
            {kind === "contacts" ? (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-propnex-border text-left text-[0.7rem] tracking-[0.08em] text-propnex-muted uppercase">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-propnex-border/60 hover:bg-propnex-bg/50"
                    >
                      <td className="px-4 py-3 text-foreground">
                        {[c.firstName, c.lastName].filter(Boolean).join(" ") ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-propnex-muted">
                        {c.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-propnex-muted">
                        {c.phone ? formatPhoneDisplay(c.phone) : "—"}
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
                    <th className="px-4 py-3 font-medium">Caller</th>
                    <th className="px-4 py-3 font-medium">Direction</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCallLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-propnex-border/60 hover:bg-propnex-bg/50"
                    >
                      <td className="px-4 py-3 text-foreground">
                        <div>{log.leadPhone ? formatPhoneDisplay(log.leadPhone) : "—"}</div>
                        {log.leadName ? (
                          <div className="text-xs text-propnex-muted">
                            {log.leadName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {log.direction}
                      </td>
                      <td className="px-4 py-3 text-propnex-muted">
                        {log.status}
                      </td>
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
                  {filteredAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-propnex-border/60 hover:bg-propnex-bg/50"
                    >
                      <td className="px-4 py-3 text-foreground">
                        {agent.name}
                      </td>
                      <td className="px-4 py-3 text-propnex-muted">
                        {agent.type}
                      </td>
                      <td className="px-4 py-3 text-propnex-muted">
                        {agent.status}
                      </td>
                      <td className="px-4 py-3 text-propnex-muted">
                        {agent.enabled ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3 text-propnex-muted">
                        {formatDate(agent.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/agents/${agent.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Settings2 className="size-3.5" />
                            Configure
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleUnassign(agent)}
                            disabled={unassigningId === agent.id}
                            className="text-xs font-medium text-destructive hover:underline disabled:opacity-50"
                          >
                            {unassigningId === agent.id
                              ? "Removing…"
                              : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
