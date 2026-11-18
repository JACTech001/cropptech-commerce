import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "FAQs | CroppTech Commerce Store" };

const faqs = [
  ["How are the collections organised?", "The Men and Women collections show clothing for the selected audience only. Linen Wear is a shared collection containing linen pieces for both men and women."],
  ["Are all items currently available to buy?", "The current catalogue is a style preview. Confirmed inventory, prices, sizes and availability will be published before orders open."],
  ["How do I contact customer support?", "Verified customer-service email and WhatsApp details will be published on the Contact page once confirmed."],
  ["Where can I find delivery and return information?", "Delivery coverage, fees, timelines and the returns/refunds policy will be published before checkout becomes available."]
];

export default function FAQPage() {
  return (
    <StorePageShell eyebrow="CUSTOMER CARE / FREQUENTLY ASKED QUESTIONS" title={<>A few things<br /><em>worth knowing.</em></>} intro="Helpful information about browsing the CroppTech collections and the store.">
      <div className="faq-list">{faqs.map(([question, answer]) => <article key={question}><h2>{question}</h2><p>{answer}</p></article>)}</div>
    </StorePageShell>
  );
}
