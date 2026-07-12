"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";

import { CreateSpreadsheetDialog } from "@/components/integrations/create-spreadsheet-dialog";
import { ColumnMappingEditor } from "@/components/integrations/column-mapping-editor";
import { SyncControls } from "@/components/integrations/sync-controls";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client-fetch";
import { spreadsheetWebViewLink } from "@/lib/integrations/google/constants";
import type { ColumnMapping, WorkspaceIntegration } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";
import { useIntegrationsStore } from "@/stores/integrations-store";

type GoogleSheetsDetailPanelProps = {
  integration: WorkspaceIntegration;
};

export function GoogleSheetsDetailPanel({
  integration,
}: GoogleSheetsDetailPanelProps) {
  const config = integration.sheetsConfig!;
  const spreadsheets = useIntegrationsStore((s) => s.spreadsheets);
  const worksheets = useIntegrationsStore((s) => s.worksheets);
  const syncHistory = useIntegrationsStore((s) => s.syncHistory);
  const isSaving = useIntegrationsStore((s) => s.isSaving);
  const isSyncing = useIntegrationsStore((s) => s.isSyncing);
  const fetchSpreadsheets = useIntegrationsStore((s) => s.fetchSpreadsheets);
  const fetchWorksheets = useIntegrationsStore((s) => s.fetchWorksheets);
  const fetchSyncHistory = useIntegrationsStore((s) => s.fetchSyncHistory);
  const saveSheetsConfig = useIntegrationsStore((s) => s.saveSheetsConfig);
  const createSpreadsheet = useIntegrationsStore((s) => s.createSpreadsheet);
  const deleteSpreadsheet = useIntegrationsStore((s) => s.deleteSpreadsheet);
  const syncSheets = useIntegrationsStore((s) => s.syncSheets);

  const [mappings, setMappings] = useState<ColumnMapping[]>(
    config.columnMappings,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [headerColumns, setHeaderColumns] = useState<string[]>([]);
  const [showApiReference, setShowApiReference] = useState(false);

  useEffect(() => {
    fetchSpreadsheets();
    fetchSyncHistory();
  }, [fetchSpreadsheets, fetchSyncHistory]);

  useEffect(() => {
    if (config.spreadsheetId) {
      fetchWorksheets(config.spreadsheetId);
    }
  }, [config.spreadsheetId, fetchWorksheets]);

  useEffect(() => {
    setMappings(config.columnMappings);
  }, [config.columnMappings]);

  useEffect(() => {
    async function loadHeaders() {
      if (!config.spreadsheetId || !config.worksheetName) {
        setHeaderColumns([]);
        return;
      }
      try {
        const res = await apiFetch(
          `/integrations/google/sheets/headers?spreadsheetId=${config.spreadsheetId}&worksheetName=${encodeURIComponent(config.worksheetName)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as { headers: string[] };
        setHeaderColumns(data.headers.filter(Boolean));
      } catch {
        setHeaderColumns([]);
      }
    }
    loadHeaders();
  }, [config.spreadsheetId, config.worksheetName]);

  async function handleSelectSpreadsheet(spreadsheetId: string) {
    const sheet = spreadsheets.find((s) => s.id === spreadsheetId);
    await fetchWorksheets(spreadsheetId);
    const ws = useIntegrationsStore.getState().worksheets[0];
    await saveSheetsConfig({
      spreadsheetId,
      spreadsheetName: sheet?.name ?? null,
      worksheetId: ws?.id ?? null,
      worksheetName: ws?.name ?? null,
    });
  }

  async function handleWorksheetChange(worksheetId: string) {
    const ws = worksheets.find((w) => w.id === worksheetId);
    await saveSheetsConfig({
      worksheetId,
      worksheetName: ws?.name ?? null,
    });
  }

  async function handleCreateSpreadsheet(
    name: string,
    columns: ColumnMapping[],
  ) {
    setIsCreating(true);
    try {
      const sheet = await createSpreadsheet(name, columns);
      await fetchWorksheets(sheet.id);
      const ws = useIntegrationsStore.getState().worksheets[0];
      await saveSheetsConfig({
        spreadsheetId: sheet.id,
        spreadsheetName: sheet.name,
        worksheetId: ws?.id ?? null,
        worksheetName: ws?.name ?? null,
        columnMappings: columns.map((col, index) => ({
          ...col,
          spreadsheetColumn: `Column ${String.fromCharCode(65 + index)}`,
        })),
      });
      setMappings(
        columns.map((col, index) => ({
          ...col,
          spreadsheetColumn: `Column ${String.fromCharCode(65 + index)}`,
        })),
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveMappings() {
    await saveSheetsConfig({ columnMappings: mappings });
  }

  async function handleDeleteSpreadsheet(spreadsheetId: string) {
    setDeletingId(spreadsheetId);
    try {
      await deleteSpreadsheet(spreadsheetId);
      if (config.spreadsheetId === spreadsheetId) {
        setMappings([]);
      }
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3 text-sm">
        <span className="text-propnex-muted">Connected account: </span>
        <span className="font-medium text-foreground">
          {integration.connectedAccount ?? "Not connected"}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">Spreadsheets</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreate((value) => !value)}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Create new
          </Button>
        </div>

        <CreateSpreadsheetDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onCreate={handleCreateSpreadsheet}
          isCreating={isCreating}
        />

        {spreadsheets.length === 0 ? (
          <p className="text-sm text-propnex-muted">
            No spreadsheets yet. Create one to get started.
          </p>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {spreadsheets.map((sheet) => {
              const isSelected = config.spreadsheetId === sheet.id;
              const link = sheet.webViewLink ?? spreadsheetWebViewLink(sheet.id);
              return (
                <div
                  key={sheet.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2",
                    isSelected
                      ? "border-propnex-accent/50 bg-propnex-accent/5"
                      : "border-propnex-border bg-propnex-bg",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {sheet.name}
                    </p>
                    <p className="text-xs text-propnex-muted">
                      Modified {new Date(sheet.modifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    className="gap-1 shrink-0"
                  >
                    <ExternalLink className="size-3.5" />
                    Open
                  </Button>
                  {!isSelected ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectSpreadsheet(sheet.id)}
                      className="shrink-0"
                    >
                      Select
                    </Button>
                  ) : (
                    <span className="shrink-0 text-xs font-medium text-propnex-accent">
                      Active
                    </span>
                  )}
                  {confirmDeleteId === sheet.id ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        disabled={deletingId === sheet.id}
                        onClick={() => handleDeleteSpreadsheet(sheet.id)}
                      >
                        {deletingId === sheet.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === sheet.id}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => setConfirmDeleteId(sheet.id)}
                      aria-label={`Delete ${sheet.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {config.spreadsheetId ? (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Worksheet</h4>
          <select
            value={config.worksheetId ?? ""}
            onChange={(e) => handleWorksheetChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
          >
            <option value="">Select a worksheet</option>
            {worksheets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.rowCount} rows)
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Column Mapping
        </h4>
        <ColumnMappingEditor
          mappings={mappings}
          onChange={setMappings}
          columnOptions={headerColumns}
        />
        <Button size="sm" onClick={handleSaveMappings} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Save mappings"
          )}
        </Button>
      </div>

      <div className="space-y-3 border-t border-propnex-border pt-4">
        <h4 className="text-sm font-semibold text-foreground">Sync Controls</h4>
        <SyncControls
          config={config}
          history={syncHistory}
          isSyncing={isSyncing}
          onToggleAutoSync={(enabled) => saveSheetsConfig({ autoSync: enabled })}
          onSyncNow={syncSheets}
        />
      </div>

      <div className="border-t border-propnex-border pt-4">
        <button
          type="button"
          onClick={() => setShowApiReference((value) => !value)}
          className="text-sm font-medium text-propnex-accent hover:underline"
        >
          {showApiReference ? "Hide" : "Show"} Google Sheets API reference
        </button>
        {showApiReference ? (
          <div className="mt-3 space-y-2 rounded-lg border border-propnex-border bg-propnex-bg p-3 text-xs text-propnex-muted">
            <p>
              <strong className="text-foreground">spreadsheets.values.update</strong>{" "}
              — spreadsheetId, range, valueInputOption; body: values[][]
            </p>
            <p>
              <strong className="text-foreground">spreadsheets.values.append</strong>{" "}
              — spreadsheetId, range, valueInputOption; body: values[][]
            </p>
            <p>
              <strong className="text-foreground">spreadsheets.values.batchUpdate</strong>{" "}
              — spreadsheetId; body: valueInputOption, data[{`{range, values}`}]
            </p>
            <p>
              <strong className="text-foreground">spreadsheets.values.get</strong>{" "}
              — spreadsheetId, range
            </p>
            <p>
              <strong className="text-foreground">spreadsheets.create</strong>{" "}
              — body: properties.title, sheets[]
            </p>
            <p>
              <strong className="text-foreground">drive.files.list</strong>{" "}
              — q, fields
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
