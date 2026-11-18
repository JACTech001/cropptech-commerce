import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Delivery & Returns | CroppTech Commerce Store" };

export default function DeliveryReturnsPage() {
  return (
    <StorePageShell eyebrow="CUSTOMER INFORMATION / DELIVERY & RETURNS" title={<>Clear details.<br /><em>Before you order.</em></>} intro="Delivery, exchange and return information will be published here before the store begins accepting orders.">
      <div className="info-columns">
        <article><p className="eyebrow">DELIVERY</p><h2>Delivery coverage and fees</h2><p>Delivery locations, dispatch timelines, shipping fees and order-tracking arrangements are not yet confirmed. We will state these clearly before checkout is enabled.</p></article>
        <article><p className="eyebrow">RETURNS & REFUNDS</p><h2>A policy you can review first</h2><p>Return eligibility, time limits, exchange conditions and refund processing details are still being finalised. No return window or refund promise is being assumed.</p></article>
      </div>
    </StorePageShell>
  );
}
