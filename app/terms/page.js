import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Terms & Conditions | CroppTech Commerce Store", description: "Terms for using the CroppTech Commerce Store website and submitting an order request." };

export default function TermsPage() {
  return (
    <StorePageShell eyebrow="STORE INFORMATION / TERMS" title={<>Fair terms.<br /><em>Clear expectations.</em></>} intro="These terms explain the current status of the CroppTech Commerce Store website and its email-based order-request process.">
      <div className="info-single"><p className="eyebrow">PRODUCT INFORMATION</p><h2>A catalogue preview.</h2><p>Product descriptions, images, colour references, sizes and availability are provided to help you browse. Some catalogue details and images are provisional style references while the collection is being finalised. Please ask the store to confirm exact product details, size availability and stock before payment.</p></div>
      <div className="info-columns">
        <article><p className="eyebrow">PRICES & CURRENCY</p><h2>Final amounts are confirmed directly.</h2><p>Prices and currency conversions displayed on the website are for reference. The store will confirm the final payable amount, payment currency and any applicable delivery charges before accepting an order.</p></article>
        <article><p className="eyebrow">ORDER REQUESTS</p><h2>Submitting a request does not confirm an order.</h2><p>The checkout currently prepares an email. It does not reserve stock, collect payment or guarantee availability. An order is confirmed only after the store reviews the request and communicates acceptance and next steps.</p></article>
      </div>
      <div className="info-single"><p className="eyebrow">DELIVERY & WEBSITE USE</p><h2>Accurate details help us serve you.</h2><p>Delivery options, charges and estimated timelines are confirmed separately. Please provide accurate contact and delivery details and use the website lawfully. Do not attempt to disrupt the website or interfere with its operation. These terms may be updated as store features and services develop.</p></div>
      <div className="info-single"><p className="eyebrow">CONTACT</p><h2>Questions about these terms?</h2><p>Email Cropptechcommercestores@gmail.com.</p></div>
    </StorePageShell>
  );
}
