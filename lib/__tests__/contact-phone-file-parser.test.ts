import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as XLSX from "xlsx";

import {
  normalizePhoneCandidate,
  parseContactPhoneUpload,
  parsePhonesFromExcel,
  parsePhonesFromText,
} from "@/lib/contact-phone-file-parser";
import { parsePhonesFromStructuredRows } from "@/lib/contact-phone-import";

describe("parsePhonesFromStructuredRows", () => {
  it("extracts valid E.164 numbers from a phone column", () => {
    const result = parsePhonesFromStructuredRows(
      ["phone_e164", "name"],
      [
        ["+15550123456", "Alice"],
        ["+15550987654", "Bob"],
        ["+15550123456", "Duplicate"],
        ["invalid", "Bad"],
        ["", "Empty"],
      ],
    );

    assert.equal(result.phones.length, 2);
    assert.deepEqual(result.phones, ["+15550123456", "+15550987654"]);
    assert.equal(result.invalid, 2);
  });

  it("returns invalid count when no phone column is found", () => {
    const result = parsePhonesFromStructuredRows(
      ["name", "email"],
      [["Alice", "alice@example.com"]],
    );

    assert.deepEqual(result.phones, []);
    assert.equal(result.invalid, 1);
  });
});

describe("parsePhonesFromText", () => {
  it("extracts plain E.164 numbers", () => {
    const result = parsePhonesFromText(
      "Reach us at +15550123456 or +447911123456 for support.",
    );

    assert.deepEqual(result.phones, ["+15550123456", "+447911123456"]);
  });

  it("normalizes formatted international numbers", () => {
    const result = parsePhonesFromText("Call +1 (555) 123-4567 today.");

    assert.deepEqual(result.phones, ["+15551234567"]);
  });
});

describe("normalizePhoneCandidate", () => {
  it("accepts already valid E.164 numbers", () => {
    assert.equal(normalizePhoneCandidate("+15550123456"), "+15550123456");
  });

  it("strips formatting from numbers that start with +", () => {
    assert.equal(
      normalizePhoneCandidate("+1 (555) 123-4567"),
      "+15551234567",
    );
  });
});

describe("parsePhonesFromExcel", () => {
  it("reads phone numbers from the first worksheet", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["mobile", "name"],
      ["+15550123456", "Alice"],
      ["+15550987654", "Bob"],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Contacts");
    const buffer = Buffer.from(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
    );

    const result = parsePhonesFromExcel(buffer);
    assert.deepEqual(result.phones, ["+15550123456", "+15550987654"]);
  });
});

describe("parseContactPhoneUpload", () => {
  it("rejects legacy .doc files", async () => {
    await assert.rejects(
      () => parseContactPhoneUpload(Buffer.from("doc"), "contacts.doc"),
      /Legacy \.doc files are not supported/,
    );
  });

  it("rejects unknown extensions", async () => {
    await assert.rejects(
      () => parseContactPhoneUpload(Buffer.from("data"), "contacts.txt"),
      /Unsupported file type/,
    );
  });
});
