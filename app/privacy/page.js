import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Privacy | CroppTech Commerce Store" };

export default function PrivacyPage() {
  return (
    <StorePageShell eyebrow="STORE INFORMATION / PRIVACY" title={<>Your information<br /><em>matters.</em></>} intro="Our full privacy notice will explain what information is collected, why it is needed and how it is handled.">
      <div className="info-single"><p className="eyebrow">PRIVACY NOTICE</p><h2>Final privacy terms are being prepared.</h2><p>The store's data collection, payment, analytics, cookies, retention and customer-rights arrangements must be confirmed before account creation or checkout is enabled. This page is a notice that the full policy is not yet published; it is not a substitute for that policy.</p></div>
    </StorePageShell>
  );
}
