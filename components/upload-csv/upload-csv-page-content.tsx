"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  Download,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildPreviewRows,
  countValidRecords,
  CSV_FIELD_LABELS,
  downloadSampleCsv,
  guessColumnMapping,
  parseCsv,
  type ColumnMapping,
  type CsvFieldKey,
  type ParsedCsv,
} from "@/lib/csv-import";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const PREVIEW_ROW_LIMIT = 10;

const MAPPING_FIELDS: CsvFieldKey[] = ["contactName", "phoneNumber", "agentId"];

export function UploadCsvPageContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    contactName: null,
    phoneNumber: null,
    agentId: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const previewRows = useMemo(() => {
    if (!parsedCsv) {
      return [];
    }
    return buildPreviewRows(parsedCsv, mapping, PREVIEW_ROW_LIMIT);
  }, [parsedCsv, mapping]);

  const validRecordCount = useMemo(() => {
    if (!parsedCsv) {
      return 0;
    }
    return countValidRecords(parsedCsv, mapping);
  }, [parsedCsv, mapping]);

  const previewHeaders = parsedCsv?.headers ?? [];

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setImportStatus(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File exceeds the 50MB size limit.");
      return;
    }

    const text = await file.text();
    const parsed = parseCsv(text);

    if (parsed.headers.length === 0) {
      setError("The CSV file appears to be empty.");
      return;
    }

    setFileName(file.name);
    setParsedCsv(parsed);
    setMapping(guessColumnMapping(parsed.headers));
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        void processFile(file);
      }
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleMappingChange = (field: CsvFieldKey, value: string) => {
    setMapping((current) => ({
      ...current,
      [field]: value === "" ? null : value,
    }));
    setImportStatus(null);
  };

  const handleConfirmImport = () => {
    if (!parsedCsv || !mapping.phoneNumber) {
      setError("Map at least the Phone Number column before importing.");
      return;
    }

    setError(null);
    setImportStatus(
      `Validated ${validRecordCount.toLocaleString()} of ${parsedCsv.rows.length.toLocaleString()} records. Import queued for outbound campaigns.`,
    );
  };

  const canImport = Boolean(parsedCsv && mapping.phoneNumber);

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Data Integration Terminal
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-propnex-muted">
          Upload your contact lists to initialize outbound agent campaigns.
          Supported format: CSV (UTF-8).
        </p>
      </div>

      <section
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          isDragging
            ? "border-propnex-accent bg-propnex-accent/10"
            : "border-propnex-accent/70 bg-propnex-panel/40 hover:border-propnex-accent hover:bg-propnex-panel/70",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-propnex-border bg-propnex-panel">
            <CloudUpload className="size-6 text-propnex-accent" />
          </div>
          <p className="text-base font-semibold text-foreground">
            {fileName ? fileName : "Drop your CSV here"}
          </p>
          <p className="mt-1 text-sm text-propnex-muted">
            or click to browse local files
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-propnex-border/60 pt-4 text-xs tracking-wide text-propnex-muted uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>Max size: 50MB</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              downloadSampleCsv();
            }}
            className="inline-flex items-center justify-center gap-1.5 text-propnex-accent transition-colors hover:text-propnex-accent-secondary"
          >
            Download sample CSV
            <Download className="size-3.5" />
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-propnex-border bg-propnex-panel">
        <div className="flex items-center gap-2 border-b border-propnex-border px-5 py-4">
          <Filter className="size-4 text-propnex-accent" />
          <h2 className="text-base font-semibold text-foreground">Column Mapping</h2>
        </div>

        <div className="space-y-4 px-5 py-5">
          {MAPPING_FIELDS.map((field) => (
            <div key={field} className="space-y-2">
              <label
                htmlFor={`mapping-${field}`}
                className="text-xs font-medium tracking-wide text-propnex-muted uppercase"
              >
                {CSV_FIELD_LABELS[field]}
              </label>
              <div className="relative">
                <select
                  id={`mapping-${field}`}
                  value={mapping[field] ?? ""}
                  onChange={(event) => handleMappingChange(field, event.target.value)}
                  disabled={!parsedCsv}
                  className="h-10 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg px-3 pr-10 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {parsedCsv ? "Select field..." : "Upload a CSV to map columns"}
                  </option>
                  {previewHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
              </div>
            </div>
          ))}

          <Button
            onClick={handleConfirmImport}
            disabled={!canImport}
            className="mt-2 h-11 w-full gap-2 bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            Confirm Import
          </Button>

          <p className="text-center text-xs text-propnex-muted">
            {parsedCsv
              ? `System will validate ${parsedCsv.rows.length.toLocaleString()} records upon confirmation.`
              : "Upload a CSV file to begin column mapping."}
          </p>

          {importStatus ? (
            <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              {importStatus}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-propnex-border bg-propnex-panel">
        <div className="flex flex-col gap-3 border-b border-propnex-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Data Preview (First {PREVIEW_ROW_LIMIT} Rows)
          </h2>
          <span className="inline-flex w-fit rounded-full border border-propnex-border bg-propnex-bg px-3 py-1 text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            {fileName ? `Scanning: ${fileName}` : "Awaiting upload"}
          </span>
        </div>

        <div className="overflow-x-auto">
          {parsedCsv && previewHeaders.length > 0 ? (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
                  <th className="px-5 py-3 font-medium">#</th>
                  {previewHeaders.map((header) => (
                    <th key={header} className="px-5 py-3 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr
                    key={row.index}
                    className="border-b border-propnex-border/70 last:border-b-0"
                  >
                    <td className="px-5 py-4 text-propnex-muted">{row.index}</td>
                    {previewHeaders.map((header) => {
                      const value = row.cells[header] ?? "";
                      const isPhoneColumn = header === mapping.phoneNumber;

                      return (
                        <td
                          key={header}
                          className={cn(
                            "px-5 py-4",
                            isPhoneColumn && row.phoneInvalid
                              ? "font-medium text-[#f97316]"
                              : isPhoneColumn
                                ? "text-[#67e8f9]"
                                : "text-foreground",
                          )}
                        >
                          {value || "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-propnex-muted">
              Upload a CSV to preview contact data and validate phone numbers.
            </div>
          )}
        </div>
      </section>

      <div className="rounded-xl border border-propnex-border bg-propnex-panel/60 px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">CSV format</h3>
        <p className="mt-1 text-sm text-propnex-muted">
          Include a header row with{" "}
          <code className="rounded bg-propnex-bg px-1.5 py-0.5 text-propnex-accent">
            full_name
          </code>
          ,{" "}
          <code className="rounded bg-propnex-bg px-1.5 py-0.5 text-propnex-accent">
            phone_e164
          </code>
          , and{" "}
          <code className="rounded bg-propnex-bg px-1.5 py-0.5 text-propnex-accent">
            email
          </code>
          . Phone numbers must use E.164 format (e.g.{" "}
          <code className="rounded bg-propnex-bg px-1.5 py-0.5 text-foreground">
            +15550123456
          </code>
          ). Optionally add{" "}
          <code className="rounded bg-propnex-bg px-1.5 py-0.5 text-propnex-accent">
            agent_id
          </code>{" "}
          to route contacts to a specific agent.
        </p>
      </div>
    </div>
  );
}
