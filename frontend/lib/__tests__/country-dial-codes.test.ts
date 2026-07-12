import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildStoredContactPhone,
  resolveDialCode,
  splitStoredContactPhone,
} from "@/lib/country-dial-codes";

describe("resolveDialCode", () => {
  it("resolves supported ISO codes case-insensitively", () => {
    assert.equal(resolveDialCode("IN"), "91");
    assert.equal(resolveDialCode("us"), "1");
    assert.equal(resolveDialCode("Gb"), "44");
    assert.equal(resolveDialCode("AU"), "61");
  });

  it("returns null for unknown codes", () => {
    assert.equal(resolveDialCode("ZZ"), null);
    assert.equal(resolveDialCode(""), null);
  });
});

describe("buildStoredContactPhone", () => {
  it("combines dial code with 10-digit local number", () => {
    assert.equal(buildStoredContactPhone("IN", "9876543210"), "919876543210");
    assert.equal(buildStoredContactPhone("US", "5551234567"), "15551234567");
    assert.equal(buildStoredContactPhone("GB", "7911123456"), "447911123456");
    assert.equal(buildStoredContactPhone("AU", "4123456789"), "614123456789");
  });

  it("rejects invalid country or local number", () => {
    assert.equal(buildStoredContactPhone("XX", "9876543210"), null);
    assert.equal(buildStoredContactPhone("IN", "123"), null);
    assert.equal(buildStoredContactPhone("IN", "+919876543210"), null);
  });
});

describe("splitStoredContactPhone", () => {
  it("splits stored international numbers into country and local", () => {
    assert.deepEqual(splitStoredContactPhone("919876543210"), {
      country: "IN",
      local: "9876543210",
    });
    assert.deepEqual(splitStoredContactPhone("15551234567"), {
      country: "US",
      local: "5551234567",
    });
  });

  it("handles legacy 10-digit numbers without country", () => {
    assert.deepEqual(splitStoredContactPhone("9876543210"), {
      country: "",
      local: "9876543210",
    });
  });

  it("returns null for unrecognized formats", () => {
    assert.equal(splitStoredContactPhone("123"), null);
    assert.equal(splitStoredContactPhone(""), null);
  });
});
