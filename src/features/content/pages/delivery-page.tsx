import { Store, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDeliveryOptionsQuery } from "@/features/checkout/checkout-api";
import { formatNaira } from "@/lib/format";
import { ContentPage, StillStuck } from "../components/content-page";

/** Fees come straight from the API, so this page is always current. */
export default function DeliveryPage() {
  const { data: options, isLoading } = useGetDeliveryOptionsQuery();
  return (
    <ContentPage
      title="Delivery & pickup"
      intro="Choose at checkout. Every order — pickup included — is paid online by bank transfer first."
    >
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-tile" />
            ))
          : options?.map((o) => {
              const Icon = o.type === "pickup" ? Store : Truck;
              return (
                <li
                  key={o._id}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 md:p-6"
                >
                  <span className="flex size-11 flex-none items-center justify-center rounded-lg bg-muted">
                    <Icon size={22} strokeWidth={1.8} className="text-primary" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <h2 className="text-base font-semibold">{o.name}</h2>
                      <span className="font-mono text-base font-semibold">
                        {formatNaira(o.fee)}
                      </span>
                    </div>
                    {o.description && (
                      <p className="mt-1 text-[15px] leading-normal text-ink-2">{o.description}</p>
                    )}
                  </div>
                </li>
              );
            })}
      </ul>
      <div className="rounded-2xl border border-border bg-card p-5 text-[15px] leading-relaxed text-ink-2 md:p-6">
        <h2 className="mb-2 text-base font-semibold text-foreground">Good to know</h2>
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">
          <li>
            Orders are processed within 24 hours of payment; Lagos deliveries usually take 1–3
            working days.
          </li>
          <li>The rider calls the phone number on your address on delivery day.</li>
          <li>
            For pickup, wait for “Ready for pickup” in your orders, then bring your order number.
          </li>
          <li>The fee you pay is fixed when you order — later fee changes don't affect it.</li>
        </ul>
      </div>
      <StillStuck />
    </ContentPage>
  );
}
