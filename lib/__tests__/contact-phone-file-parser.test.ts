import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as XLSX from "xlsx";

import {
  normalizePhoneCandidate,
  parseContactPhoneUpload,
  parsePhonesFromExcel,
  parsePhonesFromText,
} from "@/lib/contact-phone-file-parser";
import {
  contactsToCsv,
  parsePhonesFromStructuredRows,
} from "@/lib/contact-phone-import";
import {
  isValidContactPhone,
  isValidStoredContactPhone,
  normalizeContactPhone,
  normalizeStoredContactPhone,
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

describe("normalizeStoredContactPhone", () => {
  it("accepts international numbers with supported country codes", () => {
    assert.equal(normalizeStoredContactPhone("919876543210"), "919876543210");
    assert.equal(normalizeStoredContactPhone("15551234567"), "15551234567");
  });

  it("accepts legacy 10-digit numbers", () => {
    assert.equal(normalizeStoredContactPhone("9876543210"), "9876543210");
  });

  it("rejects invalid stored numbers", () => {
    assert.equal(normalizeStoredContactPhone("123"), null);
    assert.equal(normalizeStoredContactPhone("999876543210"), null);
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

describe("isValidStoredContactPhone", () => {
  it("returns true for combined international numbers", () => {
    assert.equal(isValidStoredContactPhone("919876543210"), true);
  });
});

describe("parsePhonesFromStructuredRows", () => {
  it("extracts stored numbers from country and phone columns", () => {
    const result = parsePhonesFromStructuredRows(
      ["country", "phone"],
      [
        ["IN", "9876543210"],
        ["US", "5551234567"],
        ["IN", "9876543210"],
        ["XX", "9876543210"],
        ["IN", "invalid"],
        ["", "9123456789"],
      ],
    );

    assert.equal(result.contacts.length, 2);
    assert.deepEqual(
      result.contacts.map((contact) => contact.phone),
      ["919876543210", "15551234567"],
    );
    assert.equal(result.invalid, 3);
  });

  it("extracts name, email, and address when present", () => {
    const result = parsePhonesFromStructuredRows(
      ["country", "phone", "name", "email", "address"],
      [
        [
          "IN",
          "9876543210",
          "John Doe",
          "john@example.com",
          "123 Main St",
        ],
      ],
    );

    assert.equal(result.contacts.length, 1);
    assert.deepEqual(result.contacts[0], {
      phone: "919876543210",
      name: "John Doe",
      email: "john@example.com",
      address: "123 Main St",
    });
  });

  it("uses default country when country column is missing", () => {
    const result = parsePhonesFromStructuredRows(
      ["phone"],
      [["9876543210", "Alice"]],
      { defaultCountry: "IN" },
    );

    assert.deepEqual(result.contacts.map((contact) => contact.phone), [
      "919876543210",
    ]);
    assert.equal(result.invalid, 0);
  });

  it("normalizes formatted numbers from structured rows", () => {
    const result = parsePhonesFromStructuredRows(
      ["country", "mobile"],
      [["IN", "98765 43210"]],
    );

    assert.deepEqual(result.contacts.map((contact) => contact.phone), [
      "919876543210",
    ]);
    assert.equal(result.invalid, 0);
  });

  it("returns invalid count when no phone column is found", () => {
    const result = parsePhonesFromStructuredRows(
      ["name", "email"],
      [["Alice", "alice@example.com"]],
    );

    assert.deepEqual(result.contacts, []);
    assert.equal(result.invalid, 1);
  });
});

describe("contactsToCsv", () => {
  it("exports country and local phone columns", () => {
    const csv = contactsToCsv([
      { phone: "919876543210" },
      { phone: "15551234567" },
      { phone: "9876543210" },
    ]);

    assert.equal(
      csv,
      "country,phone\nIN,9876543210\nUS,5551234567\n,9876543210",
    );
  });
});

describe("parsePhonesFromText", () => {
  it("extracts plain 10-digit numbers with default country", () => {
    const result = parsePhonesFromText(
      "Reach us at 9876543210 or 9123456789 for support.",
      "IN",
    );

    assert.deepEqual(
      result.contacts.map((contact) => contact.phone),
      ["919876543210", "919123456789"],
    );
  });

  it("does not extract numbers embedded in longer digit sequences", () => {
    const result = parsePhonesFromText("Call +919876543210 today.", "IN");

    assert.deepEqual(result.contacts, []);
  });
});

describe("normalizePhoneCandidate", () => {
  it("builds stored phone using default country", () => {
    assert.equal(normalizePhoneCandidate("9876543210", "IN"), "919876543210");
  });

  it("strips formatting from numbers", () => {
    assert.equal(normalizePhoneCandidate("98765 43210", "IN"), "919876543210");
  });
});

describe("parsePhonesFromExcel", () => {
  it("reads phone numbers from the first worksheet", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["country", "mobile"],
      ["IN", "9876543210"],
      ["US", "5551234567"],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Contacts");
    const buffer = Buffer.from(
      XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
    );

    const result = parsePhonesFromExcel(buffer);
    assert.deepEqual(
      result.contacts.map((contact) => contact.phone),
      ["919876543210", "15551234567"],
    );
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
