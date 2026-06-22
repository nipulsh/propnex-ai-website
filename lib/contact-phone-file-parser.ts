import path from "node:path";
import { pathToFileURL } from "node:url";

import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import {
  guessColumnMapping,
  isValidE164Phone,
} from "@/lib/csv-import";
import {
  parsePhonesFromStructuredRows,
  type ParsedPhoneImport,
} from "@/lib/contact-phone-import";

export const SERVER_PARSE_EXTENSIONS = [
  ".xlsx",
  ".xls",
  ".pdf",
  ".docx",
] as const;

const FORMATTED_PHONE_REGEX = /\+[\d\s().-]{7,24}/g;

let pdfWorkerConfigured = false;

function ensurePdfWorkerConfigured(): void {
  if (pdfWorkerConfigured) return;

  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  );
  PDFParse.setWorker(pathToFileURL(workerPath).href);
  pdfWorkerConfigured = true;
}

export function normalizePhoneCandidate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (isValidE164Phone(trimmed)) {
    return trimmed;
  }

  if (!trimmed.startsWith("+")) {
    return null;
  }

  const compact = `+${trimmed.slice(1).replace(/\D/g, "")}`;
  return isValidE164Phone(compact) ? compact : null;
}

export function parsePhonesFromText(text: string): ParsedPhoneImport {
  const seen = new Set<string>();
  const phones: string[] = [];
  let invalid = 0;

  const e164Matches = text.match(/\+[1-9]\d{1,14}/g) ?? [];
  for (const match of e164Matches) {
    const normalized = normalizePhoneCandidate(match);
    if (!normalized) {
      invalid++;
      continue;
    }
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    phones.push(normalized);
  }

  const formattedMatches = text.match(FORMATTED_PHONE_REGEX) ?? [];
  for (const match of formattedMatches) {
    const normalized = normalizePhoneCandidate(match);
    if (!normalized) {
      invalid++;
      continue;
    }
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    phones.push(normalized);
  }

  return { phones, invalid };
}

export function parsePhonesFromExcel(buffer: Buffer): ParsedPhoneImport {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { phones: [], invalid: 0 };
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as string[][];

  if (rows.length === 0) {
    return { phones: [], invalid: 0 };
  }

  const headers = rows[0].map((cell) => String(cell ?? "").trim());
  const dataRows = rows
    .slice(1)
    .map((row) => row.map((cell) => String(cell ?? "").trim()))
    .filter((row) => row.some((cell) => cell.length > 0));

  return parsePhonesFromStructuredRows(headers, dataRows);
}

export async function parsePhonesFromPdf(buffer: Buffer): Promise<ParsedPhoneImport> {
  ensurePdfWorkerConfigured();

  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return parsePhonesFromText(result.text);
  } finally {
    await parser.destroy();
  }
}

export async function parsePhonesFromDocx(buffer: Buffer): Promise<ParsedPhoneImport> {
  const result = await mammoth.extractRawText({ buffer });
  return parsePhonesFromText(result.value);
}

function getExtension(filename: string): string {
  const lower = filename.toLowerCase();
  const dotIndex = lower.lastIndexOf(".");
  return dotIndex === -1 ? "" : lower.slice(dotIndex);
}

export async function parseContactPhoneUpload(
  buffer: Buffer,
  filename: string,
): Promise<ParsedPhoneImport> {
  const extension = getExtension(filename);

  if (extension === ".doc") {
    throw new Error(
      "Legacy .doc files are not supported. Save as .docx or export to CSV/Excel.",
    );
  }

  switch (extension) {
    case ".xlsx":
    case ".xls":
      return parsePhonesFromExcel(buffer);
    case ".pdf":
      return parsePhonesFromPdf(buffer);
    case ".docx":
      return parsePhonesFromDocx(buffer);
    default:
      throw new Error(
        "Unsupported file type. Upload Excel (.xlsx/.xls), PDF, or Word (.docx).",
      );
  }
}

export function hasPhoneColumn(headers: string[]): boolean {
  return guessColumnMapping(headers).phoneNumber !== null;
}
