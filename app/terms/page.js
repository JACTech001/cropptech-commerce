import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Terms & Conditions | CroppTech Commerce Store" };

export default function TermsPage() {
  return (
    <StorePageShell eyebrow="STORE INFORMATION / TERMS" title={<>Fair terms.<br /><em>Clear expectations.</em></>} intro="The terms governing purchases and use of the CroppTech Commerce Store will be available here before transactions begin.">
      <div className="info-single"><p className="eyebrow">TERMS & CONDITIONS</p><h2>Terms are being finalised.</h2><p>Store ownership, order acceptance, pricing, payment, cancellations, product descriptions, liability and dispute-handling terms must be confirmed before checkout is activated. This page will be updated with the complete terms before customers can place orders.</p></div>
    </StorePageShell>
  );
}
