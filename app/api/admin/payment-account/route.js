import { decryptBankAccountNumber, encryptBankAccountNumber } from "../../../../lib/security/bank-account-encryption";
import { requireAppRole } from "../../../../lib/auth/user";
import { prisma } from "../../../../lib/db";

const fail = (message, status) => Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorized to view payment settings.", access.status);
  const account = await prisma.bankAccount.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
  if (!account) return Response.json({ account: null }, { headers: { "Cache-Control": "no-store" } });
  let lastFour;
  try { lastFour = decryptBankAccountNumber(account.accountNumberEncrypted).slice(-4); }
  catch { return fail("The saved bank account cannot be decrypted. Check the server encryption key.", 503); }
  return Response.json({
    account: {
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumberMasked: "••••••" + lastFour,
      instructions: account.instructions,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const access = await requireAppRole(["ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return fail("You are not authorized to change payment settings.", access.status);
  let body;
  try { body = await request.json(); } catch { return fail("Invalid payment account details.", 400); }

  const bankName = typeof body.bankName === "string" ? body.bankName.trim().slice(0, 100) : "";
  const accountName = typeof body.accountName === "string" ? body.accountName.trim().slice(0, 120) : "";
  const accountNumber = typeof body.accountNumber === "string" ? body.accountNumber.trim() : "";
  const instructions = typeof body.instructions === "string" ? body.instructions.trim().slice(0, 1000) : "";

  if (!bankName || !accountName || !/^\d{10}$/.test(accountNumber)) {
    return fail("Enter the bank name, account name and valid 10-digit Nigerian account number.", 400);
  }
  if (!process.env.BANK_ACCOUNT_ENCRYPTION_KEY) return fail("Bank account encryption is not configured on the server.", 503);

  let encrypted;
  try { encrypted = encryptBankAccountNumber(accountNumber); }
  catch { return fail("Bank account encryption is not available. Check the server encryption key.", 503); }

  try {
    const account = await prisma.$transaction(async (tx) => {
      await tx.bankAccount.updateMany({ where: { isActive: true }, data: { isActive: false } });
      const created = await tx.bankAccount.create({
        data: {
          bankName,
          accountName,
          accountNumberEncrypted: encrypted,
          instructions: instructions || null,
          isActive: true,
        },
      });
      await tx.adminAuditLog.create({
        data: {
          actorId: access.user.id,
          action: "PAYMENT_ACCOUNT_UPDATED",
          entityType: "BankAccount",
          entityId: created.id,
          metadata: { bankName, accountName, accountNumberLastFour: accountNumber.slice(-4) },
        },
      });
      return created;
    }, { isolationLevel: "Serializable" });

    return Response.json({
      message: "The active bank-transfer account has been updated.",
      account: { bankName: account.bankName, accountName: account.accountName, accountNumberMasked: "••••••" + accountNumber.slice(-4) },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Payment account update failed:", error);
    return fail("Could not save the bank account. Please try again.", 500);
  }
}
