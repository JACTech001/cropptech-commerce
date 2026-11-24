import { createHash } from "node:crypto";
import { requireAppRole } from "../../../../../lib/auth/user";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

function stableStringify(value) {
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.keys(value).sort().map((key) => JSON.stringify(key) + ":" + stableStringify(value[key])).join(",") + "}";
  return JSON.stringify(value);
}

const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const cash = (value, currency) => new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN" }).format(Number(value || 0));

function render(receipt) {
  const d = receipt.receiptData;
  const rows = d.items.map((item) => "<tr><td>" + esc(item.name) + "<small>" + esc(item.sku) + " · " + esc(item.size) + " / " + esc(item.colour) + "</small></td><td>" + esc(item.quantity) + "</td><td>" + cash(item.unitPrice, d.payment.currency) + "</td><td>" + cash(item.lineTotal, d.payment.currency) + "</td></tr>").join("");
  const issued = new Date(d.issuedAt).toLocaleString("en-NG");
  const paid = new Date(d.paidAt).toLocaleString("en-NG");
  return "<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Official receipt</title><style>body{font:14px Arial,sans-serif;color:#171717;background:#f4f4f4;margin:0}.sheet{max-width:780px;margin:30px auto;background:white;padding:38px}.top{display:flex;justify-content:space-between;border-bottom:2px solid #e00016;padding-bottom:20px}.brand{font-size:22px;font-weight:800}.muted,small{color:#666}.tag{color:#e00016;font-weight:bold;font-size:11px;letter-spacing:2px}.number{text-align:right}.paid{color:#176b35;font-weight:bold}.details{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:26px 0}.details h3,.payment h3{font-size:11px;color:#777;letter-spacing:1px}.items{width:100%;border-collapse:collapse}.items th,.items td{padding:10px 6px;border-bottom:1px solid #ddd;text-align:left}.items th{font-size:10px;color:#777}.totals{width:300px;margin:20px 0 0 auto}.totals p{display:flex;justify-content:space-between}.grand{border-top:1px solid #222;padding-top:10px;font-size:17px;font-weight:bold}.payment{background:#f7f7f7;padding:16px;margin-top:24px}.foot{border-top:1px solid #ddd;margin-top:24px;padding-top:16px;color:#666;font-size:12px}.actions{max-width:780px;margin:0 auto 24px;text-align:right}.actions button{background:#111;color:white;border:0;padding:12px 18px;font-weight:bold}@media(max-width:600px){.sheet{margin:0;padding:20px}.top{display:block}.number{text-align:left;margin-top:16px}.details{grid-template-columns:1fr}.items th,.items td{font-size:11px;padding:7px 3px}}@media print{body{background:white}.sheet{margin:0;max-width:none}.actions{display:none}}</style></head><body><main class='sheet'>"
  + "<header class='top'><div><div class='brand'>" + esc(d.storeName) + "</div><div class='muted'>" + esc(d.slogan) + "</div><p class='tag'>OFFICIAL PAYMENT RECEIPT</p></div><div class='number'><span>RECEIPT NUMBER</span><h2>" + esc(receipt.receiptNumber) + "</h2><span class='paid'>PAYMENT VERIFIED · PAID</span></div></header>"
  + "<section class='details'><div><h3>BILLED TO</h3><b>" + esc(d.customer.name) + "</b><p>" + esc(d.customer.email) + "</p><p>Order: " + esc(d.orderNumber) + "</p></div><div><h3>RECEIPT DETAILS</h3><p>Issued: " + esc(issued) + "</p><p>Payment verified: " + esc(paid) + "</p><p>Method: Bank transfer</p></div></section>"
  + "<table class='items'><thead><tr><th>ITEM</th><th>QTY</th><th>UNIT PRICE</th><th>AMOUNT</th></tr></thead><tbody>" + rows + "</tbody></table>"
  + "<section class='totals'><p><span>Subtotal</span><b>" + cash(d.totals.subtotal,d.payment.currency) + "</b></p><p><span>Delivery</span><b>" + cash(d.totals.delivery,d.payment.currency) + "</b></p>" + (Number(d.totals.discount)>0 ? "<p><span>Discount</span><b>−" + cash(d.totals.discount,d.payment.currency) + "</b></p>" : "") + "<p class='grand'><span>Total paid</span><strong>" + cash(d.totals.total,d.payment.currency) + "</strong></p></section>"
  + "<section class='payment'><h3>PAYMENT CONFIRMATION</h3><p>Bank: <b>" + esc(d.payment.bankName) + "</b></p><p>Transaction reference: <b>" + esc(d.payment.transactionReference) + "</b></p><p>Amount verified: <b>" + cash(d.payment.amountPaid,d.payment.currency) + "</b></p></section>"
  + "<footer class='foot'>Issued by CROPPTECH COMMERCE STORE after an administrator verified the bank transfer. Keep this receipt for your records. Support: Cropptechcommercestores@gmail.com.</footer></main><div class='actions'><button onclick='window.print()'>PRINT / SAVE AS PDF</button></div></body></html>";
}

export async function GET(_request, { params }) {
  const access = await requireAppRole(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]);
  if (access.status !== 200) return Response.json({ error: "Sign in to access this receipt." }, { status: access.status, headers: { "Cache-Control": "no-store" } });
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { payment: { include: { receipt: true } } } });
  const admin = ["ADMIN", "SUPER_ADMIN"].includes(access.user.role);
  if (!order || (!admin && order.customerId !== access.user.id)) return Response.json({ error: "Receipt not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!order.payment || order.payment.status !== "PAID" || !order.payment.receipt) return Response.json({ error: "An official receipt is not available for this order." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  const receipt = order.payment.receipt;
  const hash = createHash("sha256").update(stableStringify(receipt.receiptData)).digest("hex");
  if (hash !== receipt.snapshotHash || receipt.receiptData.receiptNumber !== receipt.receiptNumber) return Response.json({ error: "Receipt integrity check failed. Contact store support." }, { status: 409, headers: { "Cache-Control": "no-store" } });
  if (admin) await prisma.adminAuditLog.create({ data: { actorId: access.user.id, action: "PAYMENT_RECEIPT_ACCESSED", entityType: "PaymentReceipt", entityId: receipt.id, metadata: { orderNumber: order.orderNumber, receiptNumber: receipt.receiptNumber } } });
  return new Response(render(receipt), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store, max-age=0", "Pragma": "no-cache", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline; filename=\"CROPPTECH-" + receipt.receiptNumber + ".html\"" } });
}