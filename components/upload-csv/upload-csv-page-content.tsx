"use client";

import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  Download,
  Loader2,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  autoProcessCsv,
  downloadSampleCsv,
  type CategorizedLeadImport,
} from "@/lib/csv-import";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

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
          {results.total} leads imported and categorized
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LeadCategoryCard label="Hot Leads" count={results.hot} colorClass="text-orange-400" />
        <LeadCategoryCard label="Warm Leads" count={results.warm} colorClass="text-amber-400" />
        <LeadCategoryCard label="Cold Leads" count={results.cold} colorClass="text-sky-400" />
      </div>
      {results.invalid > 0 ? (
        <p className="text-sm text-propnex-muted">
          {results.invalid} row{results.invalid !== 1 ? "s" : ""} skipped due to
          invalid phone numbers.
        </p>
      ) : null}
    </div>
  );
}

export function UploadCsvPageContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      await new Promise((r) => setTimeout(r, 800));
      const { categories } = autoProcessCsv(text);
      setResults(categories);
    } catch {
      setError("Unable to process this file. Please check the format and try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) void processFile(file);
    },
    [processFile],
  );

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Upload Leads"
          description="Upload a CSV file and PropNex AI will automatically categorize your leads."
        />
        <Button
          variant="outline"
          className="gap-2 border-propnex-border"
          onClick={downloadSampleCsv}
        >
          <Download className="size-4" />
          Sample CSV
        </Button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
          isDragging
            ? "border-propnex-accent bg-propnex-accent/5"
            : "border-propnex-border bg-propnex-panel/40",
        )}
      >
        <CloudUpload className="size-10 text-propnex-accent" />
        <p className="mt-4 text-base font-medium text-foreground">
          Drag and drop your CSV file here
        </p>
        <p className="mt-1 text-sm text-propnex-muted">
          Leads are automatically mapped and categorized — no configuration needed
        </p>
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
          className="mt-6"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
        >
          Choose File
        </Button>
        {fileName ? (
          <p className="mt-3 text-xs text-propnex-muted">{fileName}</p>
        ) : null}
      </div>

      {isProcessing ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-propnex-border bg-propnex-panel py-8 text-propnex-muted">
          <Loader2 className="size-5 animate-spin" />
          Processing and categorizing leads…
        </div>
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
