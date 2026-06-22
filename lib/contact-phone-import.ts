import {
  guessColumnMapping,
  isValidE164Phone,
  parseCsv,
} from "@/lib/csv-import";

export type ParsedPhoneImport = {
  phones: string[];
  invalid: number;
};

export const CONTACT_PHONE_UPLOAD_EXTENSIONS = [
  ".csv",
  ".xlsx",
  ".xls",
  ".pdf",
  ".docx",
] as const;

export function getContactPhoneUploadExtension(
  filename: string,
): string | null {
  const lower = filename.toLowerCase();
  return (
    CONTACT_PHONE_UPLOAD_EXTENSIONS.find((ext) => lower.endsWith(ext)) ?? null
  );
}

export function isSupportedContactPhoneUpload(filename: string): boolean {
  return getContactPhoneUploadExtension(filename) !== null;
}

export function parsePhonesFromStructuredRows(
  headers: string[],
  rows: string[][],
): ParsedPhoneImport {
  if (headers.length === 0 || rows.length === 0) {
    return { phones: [], invalid: 0 };
  }

  const mapping = guessColumnMapping(headers);
  const phoneColumn = mapping.phoneNumber;

  if (!phoneColumn) {
    return { phones: [], invalid: rows.length };
  }

  const phoneIndex = headers.indexOf(phoneColumn);
  if (phoneIndex === -1) {
    return { phones: [], invalid: rows.length };
  }

  const seen = new Set<string>();
  const phones: string[] = [];
  let invalid = 0;

  for (const row of rows) {
    const raw = (row[phoneIndex] ?? "").trim();
    if (!raw) {
      invalid++;
      continue;
    }
    if (!isValidE164Phone(raw)) {
      invalid++;
      continue;
    }
    if (seen.has(raw)) {
      continue;
    }
    seen.add(raw);
    phones.push(raw);
  }

  return { phones, invalid };
}

export function parsePhonesFromCsv(text: string): ParsedPhoneImport {
  const parsed = parseCsv(text);
  return parsePhonesFromStructuredRows(parsed.headers, parsed.rows);
}

export async function parsePhonesFromUploadFile(
  file: File,
): Promise<ParsedPhoneImport> {
  const extension = getContactPhoneUploadExtension(file.name);
  if (!extension) {
    throw new Error(
      "Unsupported file type. Upload CSV, Excel (.xlsx/.xls), PDF, or Word (.docx).",
    );
  }

  if (extension === ".csv") {
    const text = await file.text();
    return parsePhonesFromCsv(text);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/contact-phones/parse-upload", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as {
    phones?: string[];
    invalid?: number;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to parse the uploaded file.");
  }

  return {
    phones: payload.phones ?? [],
    invalid: payload.invalid ?? 0,
  };
}

export const CONTACT_PHONES_SAMPLE_FILENAME = "propnex-phone-contacts-sample.csv";

export const CONTACT_PHONES_SAMPLE_CONTENT = `phone_e164
+15550123456
+15550987654
+447911123456
+61412345678
`;

export function downloadContactPhonesSampleCsv(): void {
  const blob = new Blob([CONTACT_PHONES_SAMPLE_CONTENT], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = CONTACT_PHONES_SAMPLE_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}

export function contactsToCsv(
  contacts: { phone: string }[],
): string {
  const lines = ["phone_e164", ...contacts.map((c) => c.phone)];
  return lines.join("\n");
}
