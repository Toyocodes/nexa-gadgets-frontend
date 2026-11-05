/**
 * Paystack inline checkout, restricted to bank transfer. The API rejects
 * payments from any other channel, so the popup only offers transfer.
 */

interface PaystackSetup {
  key: string;
  email: string;
  amount: number;
  currency: "NGN";
  ref: string;
  channels: string[];
  metadata?: Record<string, unknown>;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop?: { setup(options: PaystackSetup): { openIframe(): void } };
  }
}

const SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";
export const ORDER_STORAGE_KEY = "currentOrderId";

let loader: Promise<void> | null = null;

/** Load Paystack's script on first use instead of on every page. */
export function loadPaystack() {
  if (window.PaystackPop) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      reject(
        new Error("We couldn't open the payment window. Check your connection and try again."),
      );
    };
    document.head.appendChild(script);
  });
  return loader;
}

export class PaymentCancelledError extends Error {
  constructor() {
    super("Payment cancelled");
  }
}

/**
 * Opens the transfer-only popup for an order the API already created.
 * `amount` must be the server's totalAmount (naira) — Paystack wants kobo.
 * Resolves with the Paystack reference to verify.
 */
export async function payByTransfer({
  email,
  amount,
  orderId,
}: {
  email: string;
  amount: number;
  orderId: string;
}) {
  await loadPaystack();
  const pop = window.PaystackPop;
  if (!pop) throw new Error("The payment window isn't available right now.");

  // The return page reads this to know which order to verify.
  sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderId));

  return new Promise<string>((resolve, reject) => {
    pop
      .setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount: Math.round(amount * 100),
        currency: "NGN",
        channels: ["bank_transfer"],
        ref: `nexa-${orderId}-${Date.now()}`,
        metadata: { orderId },
        callback: (response) => resolve(response.reference),
        onClose: () => reject(new PaymentCancelledError()),
      })
      .openIframe();
  });
}
