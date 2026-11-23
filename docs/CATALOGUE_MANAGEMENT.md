# Product catalogue management

The protected admin catalogue is available at `/admin/products`. Access is restricted server-side to active `ADMIN` and `SUPER_ADMIN` accounts.

## Product workflow

- New products default to `DRAFT` and are not returned by the public storefront API.
- Each product has a collection audience (`MEN`, `WOMEN`, or `UNISEX`) and a separate garment type (`SHIRTS`, `TROUSERS`, `SHORTS`, `SETS`, `DRESSES`, `SKIRTS`, or `OTHER`).
- Product variants hold their own SKU, size, colour, price, stock quantity, and sellable flag.
- Different angles of the same item belong in one product image gallery. The first image is the primary storefront image.
- Removing a saved variant deactivates it rather than deleting order history. Removing an image removes its database gallery record; the Cloudinary asset itself is retained.
- A product can only be activated when it has at least one sellable variant and one image. Confirm garment details, price, sizes, colours, and actual stock before activation.
- Archived products are excluded from the public catalogue.

## Cloudinary configuration

Set these server-side environment variables in local development and the Vercel project:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The API secret must never be sent to the browser or committed to Git. The admin upload flow requests a short-lived signed upload payload from the server, then uploads image files directly to Cloudinary. Upload signatures restrict files to common image formats and a 10 MB maximum.

## Database change

The garment-type field is added by migration `20261123120000_add_product_type`. Apply pending migrations to the development Neon branch before testing the updated app:

```powershell
npx prisma migrate dev
npx prisma generate
```

## Routes

- `GET /api/admin/products`: admin-only catalogue list.
- `POST /api/admin/products`: create a draft or explicitly activated product.
- `PATCH /api/admin/products`: update product details, variants, stock, status, and gallery.
- `POST /api/admin/products/upload-signature`: admin-only signed Cloudinary upload parameters.
- `GET /api/products`: public active catalogue for the storefront.

All public order totals and variant availability are still revalidated server-side at checkout.
