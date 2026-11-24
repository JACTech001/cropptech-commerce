import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Privacy | CroppTech Commerce Store", description: "How CroppTech Commerce Store uses customer account, order, delivery and payment-submission information." };

export default function PrivacyPage() {
  return (
    <StorePageShell eyebrow="STORE INFORMATION / PRIVACY" title={<>Your information<br /><em>matters.</em></>} intro="This notice explains the customer information used when you browse the store, create an account, place an order and submit bank-transfer details.">
      <div className="info-single">
        <p className="eyebrow">INFORMATION WE HANDLE</p>
        <h2>Account, order and delivery details.</h2>
        <p>When you create or use a customer account, the store processes your account name and email address. When you place an order, the store also records the recipient name, phone number, delivery address, selected products, sizes, colours, quantities, order total and order status. Optional delivery notes and landmarks are used to help complete delivery.</p>
      </div>
      <div className="info-columns">
        <article>
          <p className="eyebrow">PAYMENT SUBMISSIONS</p>
          <h2>Transfer details and receipts.</h2>
          <p>If you submit a bank-transfer payment, the store receives the sending account name, sending bank, amount transferred, transaction reference, any note you provide and the receipt file you upload. These details are used to review and verify the payment. A receipt is supporting evidence and does not automatically mark an order as paid.</p>
        </article>
        <article>
          <p className="eyebrow">HOW WE USE INFORMATION</p>
          <h2>To operate and support your order.</h2>
          <p>Customer information is used to manage your account, validate and reserve selected stock, calculate delivery charges, process orders, verify transfers, arrange fulfilment, respond to enquiries and review customer support or return requests.</p>
        </article>
      </div>
      <div className="info-columns">
        <article>
          <p className="eyebrow">ACCESS</p>
          <h2>Order information is used by the store team.</h2>
          <p>Customer account and order information is available to the store systems and authorized administrators who need it to manage products, payments, orders and customer support. Uploaded payment receipts are handled through the order-payment review process and are not intended to be public product content.</p>
        </article>
        <article>
          <p className="eyebrow">BROWSER STORAGE</p>
          <h2>Your shopping bag stays in your browser.</h2>
          <p>The website uses browser storage to remember items in your shopping cart between visits. You can clear this browser data, but doing so may remove the locally saved cart. Placed orders remain available through your signed-in customer account.</p>
        </article>
      </div>
      <div className="info-single">
        <p className="eyebrow">KEEP YOUR DETAILS SAFE</p>
        <h2>Never share passwords or banking secrets.</h2>
        <p>Do not send your account password, card PIN, one-time password or banking login details to the store. Only provide the payment-submission details requested on your order page. For questions or requests about information associated with your account or orders, contact Cropptechcommercestores@gmail.com.</p>
      </div>
    </StorePageShell>
  );
}
