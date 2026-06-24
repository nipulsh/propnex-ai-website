"use client";

import { useCallback, useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CONTACT_PHONE_UPLOAD_EXTENSIONS,
  downloadContactPhonesSampleCsv,
  isSupportedContactPhoneUpload,
  parsePhonesFromUploadFile,
} from "@/lib/contact-phone-import";
import { importUploadedContacts } from "@/lib/graphql/api";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const UPLOAD_ACCEPT = [
  ...CONTACT_PHONE_UPLOAD_EXTENSIONS,
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

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

      if (!isSupportedContactPhoneUpload(file.name)) {
        setError(
          "Unsupported file type. Upload CSV, Excel (.xlsx/.xls), PDF, or Word (.docx).",
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError("File exceeds the 50 MB limit.");
        return;
      }

      setFileName(file.name);
      setIsProcessing(true);

      try {
        const { phones, invalid } = await parsePhonesFromUploadFile(file);

        if (phones.length === 0) {
          setError(
            invalid > 0
              ? "No valid phone numbers found. Each number must be exactly 10 digits."
              : "No phone numbers found in the uploaded file.",
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
  "h-9 gap-2 border-propnex-border bg-propnex-panel text-foreground";

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
        accept={UPLOAD_ACCEPT}
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
        Upload file
      </Button>
    </>
  );
}

