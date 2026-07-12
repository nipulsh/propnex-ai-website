"use client";

import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Loader2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  autoProcessCsv,
  downloadSampleCsv,
  type CategorizedLeadImport,
} from "@/lib/csv-import";
import { importLeads } from "@/lib/graphql/api";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export type UploadLeadsState = ReturnType<typeof useUploadLeads>;

export function useUploadLeads() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CategorizedLeadImport | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setResults(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File exceeds the 50 MB limit.");
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const { rows } = autoProcessCsv(text);

      if (rows.length === 0) {
        setError(
          "No valid leads found. Phone numbers must be in E.164 format (e.g. +15550123456).",
        );
        return;
      }

      const data = await importLeads(
        rows.map((row) => ({
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          temperature: row.temperature.toUpperCase(),
        })),
      );

      const saved = data.leads.importRows;
      setResults({
        hot: saved.hot,
        warm: saved.warm,
        cold: saved.cold,
        total: saved.total,
        invalid: saved.invalid,
        created: saved.created,
        updated: saved.updated,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save leads. Please check the format and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    inputRef,
    fileName,
    isProcessing,
    error,
    results,
    processFile,
    openFilePicker: () => inputRef.current?.click(),
  };
}

const buttonClassName =
  "h-11 gap-2 border-propnex-border bg-propnex-panel text-foreground sm:min-w-[160px]";

export function UploadCsvButtons({ upload }: { upload: UploadLeadsState }) {
  const { inputRef, isProcessing, processFile, openFilePicker } = upload;

  return (
    <>
      <Button
        variant="outline"
        className={buttonClassName}
        onClick={downloadSampleCsv}
      >
        <Download className="size-4" />
        Sample CSV
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void processFile(file);
        }}
      />
      <Button
        className={cn(
          buttonClassName,
          "border-transparent bg-propnex-accent text-propnex-bg hover:bg-propnex-accent/90",
        )}
        onClick={openFilePicker}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        Upload CSV
      </Button>
    </>
  );
}

function LeadCategoryCard({
  label,
  count,
  colorClass,
}: {
  label: string;
  count: number;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5 text-center">
      <p className={cn("text-3xl font-bold", colorClass)}>{count}</p>
      <p className="mt-1 text-sm text-propnex-muted">{label}</p>
    </div>
  );
}

function ImportResults({ results }: { results: CategorizedLeadImport }) {
  return (
    <div className="space-y-4 rounded-xl border border-propnex-border bg-propnex-panel p-6">
      <div className="flex items-center gap-2 text-success">
        <CheckCircle2 className="size-5" />
        <h3 className="font-semibold text-foreground">
          {results.total} leads saved to your organization
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LeadCategoryCard label="Hot Leads" count={results.hot} colorClass="text-orange-400" />
        <LeadCategoryCard label="Warm Leads" count={results.warm} colorClass="text-amber-400" />
        <LeadCategoryCard label="Cold Leads" count={results.cold} colorClass="text-sky-400" />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-propnex-muted">
        {results.created != null ? (
          <span>{results.created} new leads created</span>
        ) : null}
        {results.updated != null && results.updated > 0 ? (
          <span>{results.updated} existing leads updated</span>
        ) : null}
        {results.invalid > 0 ? (
          <span>
            {results.invalid} row{results.invalid !== 1 ? "s" : ""} skipped due to
            invalid or duplicate phone numbers
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function UploadLeadsFeedback({ upload }: { upload: UploadLeadsState }) {
  const { fileName, isProcessing, error, results } = upload;

  const hasFeedback =
    (fileName && !isProcessing) ||
    isProcessing ||
    error ||
    (results && !isProcessing);

  if (!hasFeedback) return null;

  return (
    <div className="flex flex-col gap-4">
      {fileName && !isProcessing ? (
        <p className="text-xs text-propnex-muted">{fileName}</p>
      ) : null}

      {isProcessing ? (
        <p className="text-sm text-propnex-muted">
          Saving leads to your organization…
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {results && !isProcessing ? <ImportResults results={results} /> : null}
    </div>
  );
}
