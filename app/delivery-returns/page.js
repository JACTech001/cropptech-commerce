import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Delivery & Returns | CroppTech Commerce Store", description: "Delivery, bank-transfer payment and returns information for CroppTech Commerce Store." };

export default function DeliveryReturnsPage() {
  return (
    <StorePageShell eyebrow="CUSTOMER INFORMATION / DELIVERY & RETURNS" title={<>Clear details.<br /><em>Before you order.</em></>} intro="Understand how Nigerian delivery, bank-transfer payment and customer support work at CroppTech Commerce Store.">
      <div className="info-columns">
        <article>
          <p className="eyebrow">DELIVERY COVERAGE</p>
          <h2>Delivery within Nigeria.</h2>
          <p>Orders can be placed for Nigerian locations with an active delivery rate configured by the store. Enter your state and city at checkout. If a location is not yet covered or its delivery rate needs review, checkout will ask you to contact the store instead of accepting the order.</p>
        </article>
        <article>
          <p className="eyebrow">DELIVERY CHARGES</p>
          <h2>Your delivery fee is part of the order total.</h2>
          <p>The delivery fee is calculated from the store&apos;s configured delivery zones and added to your product subtotal. Your order page shows the delivery amount and the full total in Nigerian naira (NGN).</p>
        </article>
      </div>
      <div className="info-single">
        <p className="eyebrow">PAYMENT</p>
        <h2>Pay by bank transfer, then submit your receipt.</h2>
        <p>After placing an order, open its order page to see the store&apos;s bank name, account name, account number and exact amount due. Transfer the exact amount and submit the sending account name, bank, transaction reference and receipt through the payment form. The store reviews the submission and verifies the transfer with its bank. Uploading a receipt does not by itself confirm payment.</p>
      </div>
      <div className="info-columns">
        <article>
          <p className="eyebrow">ORDER UPDATES</p>
          <h2>Follow progress from your account.</h2>
          <p>Your order reference and current status are available in your customer account. The store updates the order as payment is reviewed and fulfilment progresses. Keep your order number for any enquiry.</p>
        </article>
        <article>
          <p className="eyebrow">RETURNS & REFUNDS</p>
          <h2>Contact us before sending an item back.</h2>
          <p>If an item arrives damaged or differs from what was confirmed, contact the store with your order number and clear photos. Wait for the team to review your request and provide return instructions. Eligibility, time limits and refund arrangements must be confirmed with the store before a return is dispatched.</p>
        </article>
      </div>
      <div className="info-callout">
        <h2>Need help with an order?</h2>
        <a className="text-link" href="mailto:Cropptechcommercestores@gmail.com">CONTACT CUSTOMER CARE</a>
      </div>
    </StorePageShell>
  );
}
