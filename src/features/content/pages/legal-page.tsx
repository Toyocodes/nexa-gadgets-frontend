import { Navigate, useParams } from "react-router";
import { paths } from "@/app/paths";
import { ContentPage } from "../components/content-page";

/**
 * Placeholder legal pages. The bracketed text must be replaced with the
 * store's real terms and privacy policy before launch — nothing here is
 * invented legal wording.
 */
const DOCS = {
  terms: {
    title: "Terms of service",
    sections: [
      [
        "Orders and payment",
        "Orders are confirmed once payment by bank transfer through Paystack is received. Prices are in Naira.",
      ],
      [
        "Delivery and pickup",
        "Delivery is available within Lagos for the fee shown at checkout; pickup orders are collected from our store after payment.",
      ],
      ["Returns", "Unused items in original packaging can be returned within 7 days of receipt."],
      ["Full terms", "[The store's full terms of service go here.]"],
    ],
  },
  privacy: {
    title: "Privacy policy",
    sections: [
      [
        "What we collect",
        "Your username, email, delivery addresses and phone numbers, and your order history — what we need to process and deliver orders.",
      ],
      ["Payments", "Payments are handled by Paystack. We never see or store your bank details."],
      [
        "Marketing",
        "We only email you about new arrivals and deals if you opt in, and you can turn it off in Account details at any time.",
      ],
      ["Full policy", "[The store's full privacy policy goes here.]"],
    ],
  },
} as const;

export default function LegalPage() {
  const { doc } = useParams();
  if (doc !== "terms" && doc !== "privacy") return <Navigate to={paths.home} replace />;
  const page = DOCS[doc];
  return (
    <ContentPage title={page.title}>
      {page.sections.map(([heading, body]) => (
        <section key={heading} className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <h2 className="text-base font-semibold">{heading}</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{body}</p>
        </section>
      ))}
    </ContentPage>
  );
}
