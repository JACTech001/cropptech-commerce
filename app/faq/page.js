import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "FAQs | CroppTech Commerce Store", description: "Answers about the CroppTech Commerce Store linen collection and current order-request process." };

const faqs = [
  ["What does CroppTech Commerce Store sell?", "The store focuses exclusively on linen wear for men and women, including shirts, trousers, shorts, coordinated sets, dresses, skirts and relaxed layers."],
  ["How do I place an order request?", "Choose a product, select a size, add it to your cart and continue to checkout. Enter your contact and delivery details, then submit the request to prepare an email to the store."],
  ["Is my order confirmed when I submit checkout?", "No. The current checkout sends an order request by email. Our team must confirm availability, final pricing, delivery charges and payment instructions before the order is confirmed."],
  ["How do I pay?", "The current website does not collect payment. Payment instructions and the final amount will be provided by the store after your request has been reviewed."],
  ["Can I view prices in another currency?", "The currency selector can display reference prices in supported currencies. The store will confirm the final payable amount and currency before payment."],
  ["How do I ask about sizing or product details?", "Use the Contact page or email Cropptechcommercestores@gmail.com with the product name and your question."],
  ["How is delivery handled?", "Delivery options, charges and estimated timelines are confirmed with you based on your destination before an order is accepted."],
  ["What if an item arrives damaged or incorrect?", "Contact the store with your order details and clear photos. Please wait for the team's instructions before sending an item back."]
];

export default function FAQPage() {
  return (
    <StorePageShell eyebrow="CUSTOMER CARE / FREQUENTLY ASKED QUESTIONS" title={<>A few things<br /><em>worth knowing.</em></>} intro="Helpful information about shopping the CroppTech linen collection and sending an order request.">
      <div className="faq-list">{faqs.map(([question, answer]) => <article key={question}><h2>{question}</h2><p>{answer}</p></article>)}</div>
    </StorePageShell>
  );
}
