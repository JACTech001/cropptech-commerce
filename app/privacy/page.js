import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Privacy | CroppTech Commerce Store", description: "Privacy information for customers using the CroppTech Commerce Store website." };

export default function PrivacyPage() {
  return (
    <StorePageShell eyebrow="STORE INFORMATION / PRIVACY" title={<>Your information<br /><em>matters.</em></>} intro="This notice describes the information involved in the current CroppTech Commerce Store browsing and email-based order-request experience. It will be expanded as online services are added.">
      <div className="info-single"><p className="eyebrow">INFORMATION YOU ENTER</p><h2>Contact and delivery details.</h2><p>The checkout form asks for your name, email address, phone number and delivery address, along with the items you select. Optional fields may include a postal code and delivery note. Do not enter passwords or payment-card details in the checkout form.</p></div>
      <div className="info-columns">
        <article><p className="eyebrow">CURRENT CHECKOUT</p><h2>Your email app sends the request.</h2><p>At present, checkout prepares an email addressed to Cropptechcommercestores@gmail.com. The message is sent only if you choose to send it in your email application. The website does not currently provide customer accounts or an online order-history service.</p></article>
        <article><p className="eyebrow">WHY DETAILS ARE USED</p><h2>To respond to your request.</h2><p>The details in your email can be used by the store to review the requested items, contact you, confirm delivery arrangements and respond to support questions. Your email provider handles the message under its own terms and privacy practices.</p></article>
      </div>
      <div className="info-single"><p className="eyebrow">QUESTIONS</p><h2>Contact the store about your information.</h2><p>For questions or requests relating to information you have sent to the store, email Cropptechcommercestores@gmail.com. This notice will be updated if the store adds accounts, online order storage, payment processing or other data services.</p></div>
    </StorePageShell>
  );
}
