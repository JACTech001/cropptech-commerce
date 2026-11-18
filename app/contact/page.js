import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Contact | CroppTech Commerce Store" };

export default function ContactPage() {
  return (
    <StorePageShell eyebrow="CUSTOMER CARE / CONTACT" title={<>We're here to<br /><em>help you.</em></>} intro="Questions about a collection or an order? This is where CroppTech customer support information will live.">
      <div className="info-single">
        <p className="eyebrow">GET IN TOUCH</p><h2>Official contact channels are being prepared.</h2>
        <p>Our public customer-service email address and WhatsApp number have not yet been supplied. We will publish verified contact details here before order enquiries open.</p>
        <p>Please check back for the official support channels. We do not want to display an unverified number or email address.</p>
      </div>
    </StorePageShell>
  );
}
