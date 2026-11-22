import {
  createCipheriv,
  createDecipheriv,
  randomBytes
} from "node:crypto";

const ENCRYPTION_VERSION = "v1";
const AUTHENTICATED_DATA = Buffer.from(
  "cropptech:bank-account:v1",
  "utf8"
);
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
const KEY_LENGTH_BYTES = 32;
const MAX_ACCOUNT_NUMBER_LENGTH = 128;

function getEncryptionKey() {
  const encodedKey = process.env.BANK_ACCOUNT_ENCRYPTION_KEY;

  if (!encodedKey) {
    throw new Error("BANK_ACCOUNT_ENCRYPTION_KEY is not configured.");
  }

  // Require canonical base64 so malformed or ambiguously encoded keys fail closed.
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encodedKey)) {
    throw new Error("BANK_ACCOUNT_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }

  const key = Buffer.from(encodedKey, "base64");

  if (
    key.length !== KEY_LENGTH_BYTES ||
    key.toString("base64") !== encodedKey
  ) {
    throw new Error("BANK_ACCOUNT_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }

  return key;
}

function decodeBase64Url(value, expectedLength) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Encrypted bank account data has an invalid format.");
  }

  const decoded = Buffer.from(value, "base64url");

  if (
    decoded.toString("base64url") !== value ||
    (expectedLength !== undefined && decoded.length !== expectedLength)
  ) {
    throw new Error("Encrypted bank account data has an invalid format.");
  }

  return decoded;
}

/**
 * Encrypts a bank account number using AES-256-GCM.
 *
 * Stored format: v1.<base64url IV>.<base64url auth tag>.<base64url ciphertext>
 * The key must be a randomly generated 32-byte value encoded as base64.
 */
export function encryptBankAccountNumber(accountNumber) {
  if (typeof accountNumber !== "string") {
    throw new TypeError("Bank account number must be a string.");
  }

  const normalizedAccountNumber = accountNumber.trim();

  if (
    normalizedAccountNumber.length === 0 ||
    normalizedAccountNumber.length > MAX_ACCOUNT_NUMBER_LENGTH
  ) {
    throw new TypeError("Bank account number must contain between 1 and 128 characters.");
  }

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES
  });

  cipher.setAAD(AUTHENTICATED_DATA);

  const ciphertext = Buffer.concat([
    cipher.update(normalizedAccountNumber, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url")
  ].join(".");
}

/**
 * Decrypts a value previously returned by encryptBankAccountNumber.
 * Authentication failures are intentionally reported without exposing crypto details.
 */
export function decryptBankAccountNumber(encryptedValue) {
  if (typeof encryptedValue !== "string" || encryptedValue.length > 1024) {
    throw new TypeError("Encrypted bank account data is invalid.");
  }

  const parts = encryptedValue.split(".");

  if (parts.length !== 4 || parts[0] !== ENCRYPTION_VERSION) {
    throw new Error("Encrypted bank account data has an unsupported format or version.");
  }

  const [, encodedIv, encodedAuthTag, encodedCiphertext] = parts;
  const iv = decodeBase64Url(encodedIv, IV_LENGTH_BYTES);
  const authTag = decodeBase64Url(encodedAuthTag, AUTH_TAG_LENGTH_BYTES);
  const ciphertext = decodeBase64Url(encodedCiphertext);

  if (ciphertext.length === 0) {
    throw new Error("Encrypted bank account data is empty.");
  }

  const key = getEncryptionKey();

  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv, {
      authTagLength: AUTH_TAG_LENGTH_BYTES
    });

    decipher.setAAD(AUTHENTICATED_DATA);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]).toString("utf8");
  } catch {
    throw new Error(
      "Unable to decrypt bank account data. Verify the encryption key and stored value."
    );
  }
}
