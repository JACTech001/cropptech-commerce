# CroppTech Commerce Store

A standalone fashion commerce storefront for CroppTech, separate from the main CroppTech website.

**Brand line:** BUSINESS MOVES WITH COMMERCE.

## Store direction
- Men's and women's fashion, with linen as the lead collection
- Deep crimson accent, warm linen neutrals, white and charcoal
- Responsive storefront foundation
- Nigeria-only launch with NGN checkout and manual bank transfer

## Current build
The storefront, cart and Neon Auth customer sign-in/sign-up flows are implemented. Checkout now creates server-validated orders in PostgreSQL, calculates delivery from configured Nigerian shipping zones, stores encrypted bank-account snapshots, and supports private bank-transfer receipt submissions. The protected `/admin` page provides payment-account and delivery-zone configuration plus order/payment review.

The public product catalogue is still provisional editorial/demo content. The development database currently has no approved Product or ProductVariant records. Do not accept live orders until approved product variants, real stock, current prices and approved product photos have been entered. Checkout deliberately rejects products that are not active in the database.

## Run locally
```powershell
npm install
npm run dev
```
Open http://localhost:3000.

For a local production build on Windows, use:
```powershell
npx next build --webpack
```

## Checkout setup
See [docs/CHECKOUT_IMPLEMENTATION.md](docs/CHECKOUT_IMPLEMENTATION.md) for:
- Required environment variables for bank-account encryption and Cloudinary private receipt uploads
- Admin setup for the bank-transfer account and Nigerian delivery zones
- Server-side order, stock and payment verification behaviour
- Product catalogue prerequisites and remaining production work

## Remaining milestones
1. Complete product management, image uploads, variants and stock administration.
2. Complete customer order history, order cancellation/expiry, stock release and refunds.
3. Add shipment management and customer notifications through a configured email provider.
4. Review production auth origins, SMTP, environment variables, security and deployment configuration.
5. Approve real catalogue photography, prices and stock before launch.

## Stack
- Next.js App Router
- React
- JavaScript
- CSS
- Prisma 6 + Neon PostgreSQL
- Neon Managed Auth
- Cloudinary for private payment receipt storage
- Lucide icons
