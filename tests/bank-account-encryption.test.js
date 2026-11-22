import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

process.env.BANK_ACCOUNT_ENCRYPTION_KEY = randomBytes(32).toString("base64");

const {
  decryptBankAccountNumber,
  encryptBankAccountNumber
} = await import("../lib/security/bank-account-encryption.js");

test("encrypts and decrypts a bank account number", () => {
  const original = "0087194570";
  const encrypted = encryptBankAccountNumber(original);

  assert.notEqual(encrypted, original);
  assert.equal(decryptBankAccountNumber(encrypted), original);
});

test("uses a fresh nonce so encrypting the same value twice produces different ciphertext", () => {
  const first = encryptBankAccountNumber("0087194570");
  const second = encryptBankAccountNumber("0087194570");

  assert.notEqual(first, second);
  assert.equal(decryptBankAccountNumber(first), "0087194570");
  assert.equal(decryptBankAccountNumber(second), "0087194570");
});

test("rejects invalid plaintext input", () => {
  assert.throws(() => encryptBankAccountNumber(""));
  assert.throws(() => encryptBankAccountNumber("   "));
  assert.throws(() => encryptBankAccountNumber(87194570));
});

test("rejects malformed or unsupported encrypted values", () => {
  assert.throws(() => decryptBankAccountNumber("not-encrypted"));
  assert.throws(() => decryptBankAccountNumber("v2.a.b.c"));
});

test("detects tampering with the authentication tag", () => {
  const encrypted = encryptBankAccountNumber("0087194570");
  const parts = encrypted.split(".");
  parts[2] = `${parts[2][0] === "A" ? "B" : "A"}${parts[2].slice(1)}`;

  assert.throws(() => decryptBankAccountNumber(parts.join(".")));
});

test("fails closed when the encryption key is missing", () => {
  const encrypted = encryptBankAccountNumber("0087194570");
  const originalKey = process.env.BANK_ACCOUNT_ENCRYPTION_KEY;
  delete process.env.BANK_ACCOUNT_ENCRYPTION_KEY;

  try {
    assert.throws(() => decryptBankAccountNumber(encrypted), /not configured/);
  } finally {
    process.env.BANK_ACCOUNT_ENCRYPTION_KEY = originalKey;
  }
});

test("fails closed when a different key is configured", () => {
  const encrypted = encryptBankAccountNumber("0087194570");
  const originalKey = process.env.BANK_ACCOUNT_ENCRYPTION_KEY;
  process.env.BANK_ACCOUNT_ENCRYPTION_KEY = randomBytes(32).toString("base64");

  try {
    assert.throws(() => decryptBankAccountNumber(encrypted), /Unable to decrypt/);
  } finally {
    process.env.BANK_ACCOUNT_ENCRYPTION_KEY = originalKey;
  }
});
