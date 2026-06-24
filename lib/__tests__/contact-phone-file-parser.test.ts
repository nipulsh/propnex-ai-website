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
import {
  isValidContactPhone,
  normalizeContactPhone,
} from "@/lib/contact-phone-validation";

describe("normalizeContactPhone", () => {
  it("accepts plain 10-digit numbers", () => {
    assert.equal(normalizeContactPhone("9876543210"), "9876543210");
  });

  it("strips formatting and normalizes to 10 digits", () => {
    assert.equal(normalizeContactPhone("98765 43210"), "9876543210");
    assert.equal(normalizeContactPhone("98765-43210"), "9876543210");
    assert.equal(normalizeContactPhone("(987) 654-3210"), "9876543210");
  });

  it("rejects numbers with wrong digit count", () => {
    assert.equal(normalizeContactPhone("123456789"), null);
    assert.equal(normalizeContactPhone("12345678901"), null);
    assert.equal(normalizeContactPhone("+919876543210"), null);
  });

  it("rejects non-numeric input", () => {
    assert.equal(normalizeContactPhone("abc123"), null);
    assert.equal(normalizeContactPhone("'; DROP TABLE--"), null);
    assert.equal(normalizeContactPhone(""), null);
  });
});

describe("isValidContactPhone", () => {
  it("returns true for valid 10-digit numbers", () => {
    assert.equal(isValidContactPhone("9876543210"), true);
  });

  it("returns false for invalid input", () => {
    assert.equal(isValidContactPhone("invalid"), false);
    assert.equal(isValidContactPhone("123"), false);
  });
});

describe("parsePhonesFromStructuredRows", () => {
  it("extracts valid 10-digit numbers from a phone column", () => {
    const result = parsePhonesFromStructuredRows(
      ["phone", "name"],
      [
        ["9876543210", "Alice"],
        ["9123456789", "Bob"],
        ["9876543210", "Duplicate"],
        ["invalid", "Bad"],
        ["", "Empty"],
      ],
    );

    assert.equal(result.phones.length, 2);
    assert.deepEqual(result.phones, ["9876543210", "9123456789"]);
    assert.equal(result.invalid, 2);
  });

  it("normalizes formatted numbers from structured rows", () => {
    const result = parsePhonesFromStructuredRows(
      ["mobile", "name"],
      [["98765 43210", "Alice"]],
    );

    assert.deepEqual(result.phones, ["9876543210"]);
    assert.equal(result.invalid, 0);
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
  it("extracts plain 10-digit numbers", () => {
    const result = parsePhonesFromText(
      "Reach us at 9876543210 or 9123456789 for support.",
    );

    assert.deepEqual(result.phones, ["9876543210", "9123456789"]);
  });

  it("does not extract numbers embedded in longer digit sequences", () => {
    const result = parsePhonesFromText("Call +919876543210 today.");

    assert.deepEqual(result.phones, []);
  });
});

describe("normalizePhoneCandidate", () => {
  it("accepts already valid 10-digit numbers", () => {
    assert.equal(normalizePhoneCandidate("9876543210"), "9876543210");
  });

  it("strips formatting from numbers", () => {
    assert.equal(normalizePhoneCandidate("98765 43210"), "9876543210");
  });
});

describe("parsePhonesFromExcel", () => {
  it("reads phone numbers from the first worksheet", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["mobile", "name"],
      ["9876543210", "Alice"],
      ["9123456789", "Bob"],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Contacts");
    const buffer = Buffer.from(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
    );

    const result = parsePhonesFromExcel(buffer);
    assert.deepEqual(result.phones, ["9876543210", "9123456789"]);
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
