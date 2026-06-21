import {
  guessColumnMapping,
  isValidE164Phone,
  parseCsv,
} from "@/lib/csv-import";

export type ParsedPhoneImport = {
  phones: string[];
  invalid: number;
};

export function parsePhonesFromCsv(text: string): ParsedPhoneImport {
  const parsed = parseCsv(text);
  if (parsed.headers.length === 0 || parsed.rows.length === 0) {
    return { phones: [], invalid: 0 };
  }

  const mapping = guessColumnMapping(parsed.headers);
  const phoneColumn = mapping.phoneNumber;

  if (!phoneColumn) {
    const invalid = parsed.rows.length;
    return { phones: [], invalid };
  }

  const phoneIndex = parsed.headers.indexOf(phoneColumn);
  if (phoneIndex === -1) {
    return { phones: [], invalid: parsed.rows.length };
  }

  const seen = new Set<string>();
  const phones: string[] = [];
  let invalid = 0;

  for (const row of parsed.rows) {
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
