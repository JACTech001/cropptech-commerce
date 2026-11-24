import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Terms & Conditions | CroppTech Commerce Store", description: "Terms for browsing, ordering and paying for products at CroppTech Commerce Store." };

export default function TermsPage() {
  return (
    <StorePageShell eyebrow="STORE INFORMATION / TERMS" title={<>Fair terms.<br /><em>Clear expectations.</em></>} intro="Please review these terms before placing an order with CroppTech Commerce Store. They describe the current catalogue, checkout, payment and delivery process.">
      <div className="info-single">
        <p className="eyebrow">01 / PRODUCT INFORMATION</p>
        <h2>Check the details before ordering.</h2>
        <p>Product images, descriptions, colours, sizes and prices are provided to help you choose. Actual colour appearance may vary by screen and lighting. Product availability is based on active product variants and stock recorded by the store. If a selected product, size or colour is unavailable, checkout will not complete that order.</p>
      </div>
      <div className="info-columns">
        <article>
          <p className="eyebrow">02 / PLACING AN ORDER</p>
          <h2>Your order is created at checkout.</h2>
          <p>You must be signed in to place an order. You are responsible for providing accurate recipient, phone and Nigerian delivery details. The store checks product variants and available stock, applies a configured delivery rate and creates an order record with a unique reference. Selected stock is reserved as part of this process.</p>
        </article>
        <article>
          <p className="eyebrow">03 / PRICES & CURRENCY</p>
          <h2>Orders are charged in naira.</h2>
          <p>All orders and payments are denominated in Nigerian naira (NGN). Any other currency display is a reference conversion for browsing and is not the amount payable. The order page shows the recorded subtotal, delivery fee and total due.</p>
        </article>
      </div>
      <div className="info-single">
        <p className="eyebrow">04 / PAYMENT & CONFIRMATION</p>
        <h2>Bank transfer must be verified.</h2>
        <p>After checkout, use the bank details and exact amount shown on your order page. Submit the requested transfer details and receipt through the payment form. A payment submission or receipt does not mean payment has been accepted. The store verifies the funds before marking the payment as confirmed and moving the order forward. Do not transfer to a different account or rely on payment instructions received outside the official order page.</p>
      </div>
      <div className="info-columns">
        <article>
          <p className="eyebrow">05 / DELIVERY</p>
          <h2>Delivery depends on configured locations.</h2>
          <p>Orders are accepted only for Nigerian locations with a valid delivery rate configured by the store. The applicable fee is included in the order total. Delivery progress and any available shipment details are reflected in the order record or communicated by the store.</p>
        </article>
        <article>
          <p className="eyebrow">06 / RETURNS & SUPPORT</p>
          <h2>Contact us before returning an item.</h2>
          <p>If there is a problem with an item or delivery, contact the store with your order number and relevant photos or details. Wait for the store to review your request and provide instructions before sending anything back. Return eligibility and refund arrangements are assessed with the store; contact us for the applicable instructions.</p>
        </article>
      </div>
      <div className="info-single">
        <p className="eyebrow">07 / WEBSITE USE & CONTACT</p>
        <h2>Use the store responsibly.</h2>
        <p>Do not misuse the website, attempt unauthorized access or interfere with its operation. Store features and these terms may change as the service develops. For questions about an order or these terms, email Cropptechcommercestores@gmail.com.</p>
      </div>
    </StorePageShell>
  );
}
