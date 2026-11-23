import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Delivery & Returns | CroppTech Commerce Store", description: "Current delivery and returns information for CroppTech Commerce Store." };

export default function DeliveryReturnsPage() {
  return (
    <StorePageShell eyebrow="CUSTOMER INFORMATION / DELIVERY & RETURNS" title={<>Clear details.<br /><em>Before you order.</em></>} intro="We will confirm the practical details of your delivery with you before an order is accepted. Here is how the current order-request process works.">
      <div className="info-columns">
        <article><p className="eyebrow">DELIVERY</p><h2>Arrangements confirmed with you.</h2><p>Delivery availability, estimated timing and delivery charges depend on your destination. When you send an order request, our team will review your location and confirm the available delivery option, cost and expected timeline before payment.</p></article>
        <article><p className="eyebrow">RETURNS & REFUNDS</p><h2>Contact us before returning an item.</h2><p>If an item arrives damaged or differs from what was confirmed, contact the store with your order details and clear photos. Please wait for instructions before dispatching a return. Specific eligibility, time limits and refund arrangements will be confirmed directly while the store&apos;s formal policy is being finalised.</p></article>
      </div>
      <div className="info-single"><p className="eyebrow">PLEASE NOTE</p><h2>An order request is not yet an order confirmation.</h2><p>Checkout currently prepares an email request. Our team must confirm item availability, final amount and delivery arrangements before your order is accepted. No payment is collected through the current checkout page.</p></div>
    </StorePageShell>
  );
}
