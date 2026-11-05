/**
 * Guests can tap "+" or the heart on any product card, but cart and wishlist
 * need an account. We remember what they tried to do, send them to sign in,
 * and finish the action once they're back (see useResumePendingIntent).
 */
export type PendingIntent =
  { type: "cart"; productId: string; quantity: number } | { type: "wishlist"; productId: string };

const KEY = "nexa:pending-intent";

export function savePendingIntent(intent: PendingIntent) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(intent));
  } catch {
    /* private mode — the action just won't resume */
  }
}

export function takePendingIntent(): PendingIntent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return raw ? (JSON.parse(raw) as PendingIntent) : null;
  } catch {
    return null;
  }
}
