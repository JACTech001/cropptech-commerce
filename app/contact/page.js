import Link from "next/link";
import { ArrowUpRight, Mail, Music2, ShoppingBag } from "lucide-react";
import StorePageShell from "../../components/StorePageShell";

export const metadata = { title: "Contact | CroppTech Commerce Store" };

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const product = typeof params?.product === "string" ? params.product : "";
  const cart = typeof params?.cart === "string" ? params.cart : "";
  const selection = cart || (product ? product : "");
  const intent = typeof params?.intent === "string" ? params.intent : "enquiry";
  const isOrder = intent === "order";
  const subject = selection ? (isOrder ? "CroppTech order request" : "CroppTech product enquiry") : "Enquiry for CroppTech Commerce Store";
  const body = selection
    ? "Hello CroppTech Commerce Store,\n\nI would like to enquire about the following selection:\n" + selection + "\n\nPlease confirm availability and pricing.\n\nThank you."
    : "Hello CroppTech Commerce Store,\n\nI would like to make an enquiry.\n\nThank you.";
  const emailHref = "mailto:Cropptechcommercestores@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

  return (
    <StorePageShell eyebrow="CUSTOMER CARE / CONTACT" title={<>We're here to<br /><em>help you.</em></>} intro="Questions about a collection or an order? Reach CroppTech Commerce Store through our official contact channels.">
      <div className="contact-channel-grid">
        <article className="contact-channel-card">
          <span className="contact-channel-icon"><Mail size={22} /></span>
          <p className="eyebrow">EMAIL US</p>
          <h2>Let's talk business.</h2>
          <p>Send us product questions, order enquiries or partnership requests. Your selected items are included in the pre-filled email.</p>
          <a className="contact-channel-link" href={emailHref}>Cropptechcommercestores@gmail.com <ArrowUpRight size={16} /></a>
        </article>
        <article className="contact-channel-card">
          <span className="contact-channel-icon"><Music2 size={22} /></span>
          <p className="eyebrow">FOLLOW OUR STORE</p>
          <h2>Find us on TikTok.</h2>
          <p>Follow CroppTech for collection updates, product highlights and store content.</p>
          <a className="contact-channel-link" href="https://www.tiktok.com/@cropp.tech.commercestore?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer">@cropp.tech.commercestore <ArrowUpRight size={16} /></a>
        </article>
      </div>
      {selection && <div className="contact-selection">
        <p className="eyebrow"><ShoppingBag size={14} /> {isOrder ? "YOUR ORDER REQUEST" : "YOUR ENQUIRY SELECTION"}</p>
        <p>{selection}</p>
        <p className="contact-selection-note">Your selection is also included in the pre-filled email when you choose Email us.</p>
      </div>}
      <div className="contact-back-row"><Link href="/shop" className="text-link">CONTINUE EXPLORING THE STORE <ArrowUpRight size={16} /></Link></div>
    </StorePageShell>
  );
}
