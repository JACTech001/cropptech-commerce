import StorePageShell from "../../components/StorePageShell";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = { title: "FAQs | CroppTech Commerce Store", description: "Answers about the CroppTech Commerce Store linen collection and current order-request process." };

const faqs = [
  ["What does CroppTech Commerce Store sell?", "The store focuses exclusively on linen wear for men and women, including shirts, trousers, shorts, coordinated sets, dresses, skirts and relaxed layers."],
  ["How do I place an order?", "Sign in to your customer account, choose a product, select its colour and size, add it to your cart, and complete the Nigerian delivery details at checkout. The store checks the selected variants, stock and delivery rate before creating your order."],
  ["What happens after I place an order?", "Your order is saved with an order number and appears in your account. The order page shows the NGN total and the store bank-transfer instructions. Your order remains awaiting payment until the store verifies your transfer."],
  ["How do I pay?", "Transfer the exact NGN amount to the bank account shown on your order page. Then submit your sending-bank details, transaction reference and receipt through the payment form. A receipt alone does not confirm payment; the store verifies the transfer."],
  ["Can I view prices in another currency?", "The currency selector can show reference conversions while browsing. All orders and payments are processed in Nigerian naira (NGN), and the order page displays the amount due in NGN."],
  ["How do I ask about sizing or product details?", "Use the Contact page or email Cropptechcommercestores@gmail.com with the product name and your question."],
  ["Where do you deliver?", "The store currently accepts orders within Nigeria in locations that have an active delivery rate configured. Enter your state and city at checkout; the delivery fee is included in your order total."],
  ["What if an item arrives damaged or incorrect?", "Contact the store with your order details and clear photos. Please wait for the team's instructions before sending an item back."]
];

export default function FAQPage() {
  return (
    <StorePageShell eyebrow="CUSTOMER CARE / FREQUENTLY ASKED QUESTIONS" title={<>A few things<br /><em>worth knowing.</em></>} intro="Helpful information about shopping the CroppTech linen collection and sending an order request.">
      <div className="faq-page-heading">
        <div><p className="eyebrow">CUSTOMER SUPPORT</p><h2>Answers, without the guesswork.</h2></div>
        <p>Open a question to read more. If you still need help, our team is one message away.</p>
      </div>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => (
          <details className="faq-item" key={question}>
            <summary><span className="faq-item-number">{String(index + 1).padStart(2, "0")}</span><span>{question}</span><i aria-hidden="true" /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <div className="info-callout faq-contact-callout"><h2>Still have a question?</h2><Link href="/contact" className="text-link">CONTACT CUSTOMER CARE <ArrowUpRight size={16} /></Link></div>
    </StorePageShell>
  );
}
