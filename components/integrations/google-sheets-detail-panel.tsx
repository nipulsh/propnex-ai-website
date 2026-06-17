"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { ColumnMappingEditor } from "@/components/integrations/column-mapping-editor";
import { SyncControls } from "@/components/integrations/sync-controls";
import { Button } from "@/components/ui/button";
import type { ColumnMapping, WorkspaceIntegration } from "@/lib/integrations/types";
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
  const syncSheets = useIntegrationsStore((s) => s.syncSheets);

  const [mappings, setMappings] = useState<ColumnMapping[]>(
    config.columnMappings,
  );
  const [newSheetName, setNewSheetName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchSpreadsheets();
    fetchSyncHistory();
  }, [fetchSpreadsheets, fetchSyncHistory]);

  useEffect(() => {
    if (config.spreadsheetId) {
      fetchWorksheets(config.spreadsheetId);
    }
  }, [config.spreadsheetId, fetchWorksheets]);

  async function handleSpreadsheetChange(spreadsheetId: string) {
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

  async function handleCreateSpreadsheet() {
    const sheet = await createSpreadsheet(newSheetName || "New PropNex Sheet");
    setShowCreate(false);
    setNewSheetName("");
    await saveSheetsConfig({
      spreadsheetId: sheet.id,
      spreadsheetName: sheet.name,
      worksheetId: null,
      worksheetName: null,
    });
    await fetchWorksheets(sheet.id);
  }

  async function handleSaveMappings() {
    await saveSheetsConfig({ columnMappings: mappings });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3 text-sm">
        <span className="text-propnex-muted">Connected account: </span>
        <span className="font-medium text-foreground">
          {integration.connectedAccount}
        </span>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Spreadsheet</h4>
        <select
          value={config.spreadsheetId ?? ""}
          onChange={(e) => handleSpreadsheetChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
        >
          <option value="">Select a spreadsheet</option>
          {spreadsheets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {showCreate ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder="Spreadsheet name"
              className="h-9 flex-1 rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm"
            />
            <Button size="sm" onClick={handleCreateSpreadsheet}>
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreate(true)}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Create new spreadsheet
          </Button>
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
        <ColumnMappingEditor mappings={mappings} onChange={setMappings} />
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
    </div>
  );
}
