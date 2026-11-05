import { Link } from "react-router";
import { paths } from "@/app/paths";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContentPage, StillStuck } from "../components/content-page";

/**
 * Every answer here matches how the store actually works: bank transfer only,
 * Lagos delivery or store pickup, and no free delivery.
 */
const SECTIONS: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: "Delivery & pickup",
    items: [
      {
        q: "How do I get my order?",
        a: (
          <>
            At checkout you choose store pickup or delivery to an address in Lagos. Delivery fees
            depend on the zone and are shown before you pay — see{" "}
            <Link to={paths.delivery}>delivery & pickup</Link> for the current fees. Pickup is free;
            you pay online first, then collect.
          </>
        ),
      },
      {
        q: "Do you deliver outside Lagos?",
        a: "Not at the moment. We deliver to Lagos Mainland and Lagos Island, or you can collect from our store.",
      },
      {
        q: "How long does delivery take?",
        a: "Orders are processed within 24 hours of payment. Delivery within Lagos usually takes 1–3 working days. Our rider calls the number on your address before arriving.",
      },
      {
        q: "Can I track my order?",
        a: (
          <>
            Yes. <Link to={paths.account}>My orders</Link> shows each step: Placed → Confirmed → In
            shipping → Delivered (or Ready for pickup → Collected).
          </>
        ),
      },
    ],
  },
  {
    title: "Paying",
    items: [
      {
        q: "How do I pay?",
        a: "By bank transfer through Paystack. At checkout Paystack gives you a one-time account number; transfer the exact amount from any Nigerian bank app and your order confirms automatically.",
      },
      {
        q: "Can I pay by card or on delivery?",
        a: "No — we only accept bank transfer, and every order (including pickup) is paid online before it's released.",
      },
      {
        q: "I transferred but my order still says “Awaiting payment”.",
        a: "Transfers usually confirm within a minute. If it's been longer, message us on WhatsApp with your order number and the time you paid and we'll check it with Paystack.",
      },
    ],
  },
  {
    title: "Products & warranty",
    items: [
      {
        q: "Are your gadgets original?",
        a: "Yes. We source from manufacturers and authorised distributors, so every device is genuine.",
      },
      {
        q: "Do products come with a warranty?",
        a: "Yes — a manufacturer warranty. Most gadgets are covered for 6–12 months depending on the brand. Keep your order number; it's your proof of purchase.",
      },
      {
        q: "Who can write reviews?",
        a: "Only customers who bought and paid for the item, so every review comes from a real buyer.",
      },
    ],
  },
  {
    title: "Returns & refunds",
    items: [
      {
        q: "Can I return something?",
        a: (
          <>
            Yes, within 7 days if it's unused and in its original packaging. See{" "}
            <Link to={paths.returns}>returns</Link>.
          </>
        ),
      },
      {
        q: "How do refunds work?",
        a: "Contact us with your order number. Once we've received and checked the item, refunds go back to your bank account within 5–7 working days.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <ContentPage
      title="Help & FAQs"
      intro="Delivery times, warranty claims, returns and how to pay — answered."
    >
      {SECTIONS.map((s) => (
        <section
          key={s.title}
          className="rounded-2xl border border-border bg-card px-5 py-2 md:px-6"
        >
          <h2 className="pt-4 pb-1 text-lg font-semibold tracking-[-0.02em]">{s.title}</h2>
          <Accordion type="single" collapsible>
            {s.items.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-border last:border-b-0">
                <AccordionTrigger className="py-4 text-[15px] font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-ink-2">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
      <StillStuck />
    </ContentPage>
  );
}
