/**
 * Store-wide facts and contact details. Only real, verifiable values live
 * here — the redesign brief rules out claims the store can't back up.
 */
export const site = {
  name: "Nexa Gadgets",
  whatsappUrl: "https://wa.me/2348097662998",
  /** Optional. When unset, help links fall back to WhatsApp. */
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL as string | undefined,
  returnsWindowDays: 7,
} as const;

export const trustPoints = [
  {
    key: "delivery",
    title: "Delivery or pickup",
    detail: "Lagos Mainland, Island, or collect in store",
  },
  { key: "warranty", title: "Manufacturer warranty", detail: "Genuine products only" },
  { key: "returns", title: "7-day returns", detail: "Changed your mind? No stress" },
  { key: "payment", title: "Secure payment", detail: "Bank transfer via Paystack" },
] as const;
