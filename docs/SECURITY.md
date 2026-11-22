# Bank account encryption

CroppTech stores bank account numbers in the Prisma fields `BankAccount.accountNumberEncrypted` and `Payment.accountNumberSnapshotEncrypted`. Those field names do not encrypt values automatically. Server-side code must call the encryption helper before writing either field.

## Implementation

Use `lib/security/bank-account-encryption.js` from server-only code:

- `encryptBankAccountNumber(value)` encrypts a number using AES-256-GCM and a fresh 96-bit nonce for each encryption.
- `decryptBankAccountNumber(value)` authenticates and decrypts the versioned stored value.
- The stored envelope is `v1.<iv>.<authentication-tag>.<ciphertext>`, with binary values encoded as base64url.
- The helper fails closed if the key is missing, malformed, the stored format is unsupported, or authentication fails.

Never import this module into a Client Component or expose decrypted values to browser code, logs, analytics, URLs, or error messages.

## Generate a key for local development

Run this in PowerShell from the project directory:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Copy the generated value into your ignored local `.env` file:

```env
BANK_ACCOUNT_ENCRYPTION_KEY="PASTE_YOUR_GENERATED_BASE64_KEY_HERE"
```

Do not paste the key into chat, commit it, add it to `.env.example`, or place it in source code. Keep separate random keys for development, preview, and production. Configure the production value as a Vercel environment variable before deploying any code that encrypts or decrypts bank account data.

## Key handling and rotation

The encryption key is required to recover encrypted account numbers. Store it in a managed secret/environment-variable facility and maintain a protected backup according to the deployment's secret-management policy. Anyone with both database access and this key can decrypt the values.

Do not replace a key that has encrypted live records without first running a controlled re-encryption procedure: decrypt each record with the old key, encrypt it with the new key, verify the result, and only then retire the old key. The current helper supports one active key; key rotation with multiple key IDs must be implemented before rotating keys for records in use.

## Usage requirements

1. Validate and authorize the admin operation before reading or changing a bank account.
2. Encrypt account numbers before Prisma writes. Never pass plaintext account numbers directly to `accountNumberEncrypted` or `accountNumberSnapshotEncrypted`.
3. Decrypt only in trusted server-side workflows that genuinely need to display or use the account number.
4. Return only the minimum required information to the client. Mask account numbers in admin interfaces unless the full value is necessary.
5. Do not accept an encryption key or pre-encrypted payload from a browser request.

This helper establishes the cryptographic primitive; it does not itself add database access, authentication, admin authorization, or payment workflows. Those must be enforced by the server routes/actions that call it.
