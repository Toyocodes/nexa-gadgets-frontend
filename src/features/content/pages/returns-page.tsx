import { ContentPage, StillStuck } from "../components/content-page";

const STEPS = [
  {
    title: "Message us within 7 days",
    body: "Send your order number and the reason for the return on WhatsApp.",
  },
  {
    title: "Bring or send the item back",
    body: "It must be unused, with all accessories, in its original packaging.",
  },
  { title: "We check it", body: "Once we've inspected it, we confirm your refund or replacement." },
  {
    title: "Get your refund",
    body: "Refunds go back to your bank account within 5–7 working days.",
  },
];

export default function ReturnsPage() {
  return (
    <ContentPage
      title="7-day returns"
      intro="Changed your mind? Return unused items within 7 days of receiving them."
    >
      <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="flex gap-4 rounded-2xl border border-border bg-card p-5 md:p-6"
          >
            <span className="flex size-8 flex-none items-center justify-center rounded-full bg-foreground font-mono text-sm font-semibold text-ink-foreground">
              {i + 1}
            </span>
            <div>
              <h2 className="text-base font-semibold">{s.title}</h2>
              <p className="mt-1 text-[15px] leading-normal text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="rounded-2xl bg-muted p-5 text-[15px] leading-normal text-ink-2">
        Faulty item? That's covered by the manufacturer warranty rather than the 7-day window —
        message us and we'll help with the claim.
      </p>
      <StillStuck />
    </ContentPage>
  );
}
