# Checkout and payment implementation

## Customer flow

1. The customer signs in and opens checkout from their selected cart items.
2. The browser sends only product slug, size, colour, quantity and delivery details to `POST /api/orders`.
3. The server resolves active products and variants from PostgreSQL, checks stock, calculates prices and the shipping rate from the configured delivery zone, reserves stock inside a database transaction, and creates the order, payment snapshot, order history and inventory events.
4. The customer is redirected to `/orders/[orderNumber]`, which is scoped to the signed-in customer. It displays the server-calculated NGN total and the bank account snapshot attached to that order.
5. The customer submits bank-transfer details and a receipt through `POST /api/orders/[orderNumber]/payment-submissions`. Receipts are uploaded as Cloudinary authenticated assets; only the provider and storage key are saved in PostgreSQL.
6. The admin reviews the submission at `/admin`. The receipt is delivered through an admin-only endpoint using a short-lived signed Cloudinary download URL. An admin must verify the actual bank transaction, not just the receipt, before approving.
7. Approval marks payment paid, confirms the order and consumes its stock reservation. Rejection or a clarification request is recorded, audited and shown to the customer.

## Required server environment

Add these values to the local ignored `.env` and the relevant Vercel environments. Do not commit real values.

- `BANK_ACCOUNT_ENCRYPTION_KEY`: a random 32-byte key encoded as base64. The existing AES-256-GCM helper encrypts bank account numbers before they are stored.
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Generate the encryption key locally with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Use different keys for development, preview and production, and keep a protected backup. Do not paste secrets into chat or commit them.

## Admin configuration

The signed-in `ADMIN` or `SUPER_ADMIN` can open `/admin` to:

- Save the store's active Nigerian bank-transfer account. The account number is encrypted before persistence; the dashboard only displays a masked value. Existing orders retain their own encrypted payment-account snapshot if the active account is changed.
- Add a delivery zone by state and city, including an NGN fee and estimated delivery days.
- Review orders and payment submissions, view private receipts, and approve, reject or request clarification.

The order API requires exactly one active bank account and one unambiguous active delivery rate for the submitted state/city. It intentionally blocks checkout if either is missing or ambiguous.

## Product catalogue prerequisite

The current development database has no Product or ProductVariant records. The public storefront's eight products are still provisional inspiration entries, and their stock and some prices have not been approved. They are not automatically imported or trusted by checkout.

Before accepting real orders, the store must have approved database products with:
- `Product.status = ACTIVE`
- active `ProductVariant` records with approved SKU, size, colour, NGN price and actual stock quantity
- at least one approved `ProductImage` record per product, with a real approved product photo and product description

Checkout ignores browser-supplied prices and refuses inactive/missing variants or insufficient stock. Do not activate the provisional catalogue or invent stock values just to make checkout pass.

## Operational notes

- Payment is manual bank transfer only; there is no Paystack/card processing.
- A submitted receipt is not proof of payment.
- Orders start as `AWAITING_PAYMENT`; submitted transfer details move them to `PAYMENT_UNDER_REVIEW`.
- The admin decision endpoint checks the submitted amount against the full order total before it permits approval.
- Receipt files are private/authenticated Cloudinary assets. The customer never receives a public receipt URL.
- Order placement reserves stock in a database transaction. A stock-release/cancellation and expiry workflow still needs to be added before production launch; do not rely on an automatic 24-hour payment deadline yet.
- Email/SMS notifications are not wired to a provider yet. Customer-facing order status and payment review updates are visible on the order page.
- Product management, variant/stock management, order cancellation/refund management and shipping tracking are separate admin features still to be completed.

## Local verification

After pulling the branch:

```powershell
npx prisma generate
npx next build --webpack
npm test
```

Then configure the development bank account and at least one delivery zone in `/admin`. Do not test a real order until approved product variants and stock have been entered.
