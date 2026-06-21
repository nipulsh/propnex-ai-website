"use client";

import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  Loader2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  downloadContactPhonesSampleCsv,
  parsePhonesFromCsv,
} from "@/lib/contact-phone-import";
import { importUploadedContacts } from "@/lib/graphql/api";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export type UploadContactPhonesState = ReturnType<typeof useUploadContactPhones>;

export function useUploadContactPhones(onImported: () => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    created: number;
    skipped: number;
    invalid: number;
  } | null>(null);

  const processFile = useCallback(
    async (file: File) => {
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
        const { phones, invalid } = parsePhonesFromCsv(text);

        if (phones.length === 0) {
          setError(
            invalid > 0
              ? "No valid phone numbers found. Use E.164 format (e.g. +15550123456)."
              : "No phone numbers found in the CSV file.",
          );
          return;
        }

        const data = await importUploadedContacts(phones);
        const saved = data.uploadedContacts.importPhones;
        setResults({
          created: saved.created,
          skipped: saved.skipped,
          invalid: saved.invalid + invalid,
        });
        onImported();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to import phone numbers. Please check the format and try again.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onImported],
  );

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

export function UploadContactPhonesButtons({
  upload,
}: {
  upload: UploadContactPhonesState;
}) {
  const { inputRef, isProcessing, processFile, openFilePicker } = upload;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={buttonClassName}
        onClick={downloadContactPhonesSampleCsv}
      >
        <Download className="size-4" />
        Sample CSV
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void processFile(file);
          event.target.value = "";
        }}
      />
      <Button
        type="button"
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

export function UploadContactPhonesFeedback({
  upload,
}: {
  upload: UploadContactPhonesState;
}) {
  const { fileName, isProcessing, error, results } = upload;

  const hasFeedback =
    (fileName && !isProcessing) ||
    isProcessing ||
    error ||
    (results && !isProcessing);

  if (!hasFeedback) return null;

  return (
    <div className="flex flex-col gap-3">
      {fileName && !isProcessing ? (
        <p className="text-xs text-propnex-muted">{fileName}</p>
      ) : null}

      {isProcessing ? (
        <p className="text-sm text-propnex-muted">
          Importing phone numbers…
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {results && !isProcessing ? (
        <div className="flex items-start gap-2 rounded-lg border border-propnex-border bg-propnex-panel px-4 py-3 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          <div className="text-foreground">
            <p className="font-medium">
              {results.created} number{results.created !== 1 ? "s" : ""} added
            </p>
            <p className="mt-1 text-propnex-muted">
              {results.skipped > 0
                ? `${results.skipped} duplicate${results.skipped !== 1 ? "s" : ""} skipped. `
                : null}
              {results.invalid > 0
                ? `${results.invalid} invalid row${results.invalid !== 1 ? "s" : ""} skipped.`
                : null}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
