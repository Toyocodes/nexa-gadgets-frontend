import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { sessionExpired, signedOut } from "@/features/auth/auth-slice";

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

const STORAGE_KEY = "nexa:guest-cart";

/**
 * Only ids and quantities are stored. Titles and prices are read fresh from
 * the API, so a guest never sees a stale price.
 */
export function parseGuestCart(raw: string | null): GuestCartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return (parsed as Partial<GuestCartItem>[]).filter(
      (i): i is GuestCartItem =>
        typeof i?.productId === "string" &&
        typeof i.quantity === "number" &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0,
    );
  } catch {
    return [];
  }
}

function loadGuestCart() {
  try {
    return parseGuestCart(localStorage.getItem(STORAGE_KEY));
  } catch {
    return []; // storage blocked: the cart lasts until the tab closes
  }
}

export function saveGuestCart(items: GuestCartItem[]) {
  try {
    if (items.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked: the cart lasts until the tab closes */
  }
}

interface GuestCartState {
  items: GuestCartItem[];
  /** Moving the items into the account after sign-in. "failed" retries on the next page load. */
  merge: "idle" | "merging" | "failed";
}

const initialState = (): GuestCartState => ({ items: loadGuestCart(), merge: "idle" });

const guestCartSlice = createSlice({
  name: "guestCart",
  initialState,
  reducers: {
    guestItemAdded(state, { payload }: PayloadAction<GuestCartItem>) {
      const line = state.items.find((i) => i.productId === payload.productId);
      if (line) line.quantity += payload.quantity;
      else state.items.push(payload);
    },
    guestQuantitySet(state, { payload }: PayloadAction<GuestCartItem>) {
      const line = state.items.find((i) => i.productId === payload.productId);
      if (line) line.quantity = payload.quantity;
    },
    guestItemRemoved(state, { payload }: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== payload);
    },
    /** Another tab changed the cart. */
    guestCartSynced(state, { payload }: PayloadAction<GuestCartItem[]>) {
      state.items = payload;
    },
    // Items stay stored until the API confirms, so closing the tab mid-merge loses nothing.
    guestMergeStarted(state) {
      state.merge = "merging";
    },
    guestMergeSucceeded(state) {
      state.items = [];
      state.merge = "idle";
    },
    guestMergeFailed(state) {
      state.merge = "failed";
    },
  },
  extraReducers: (builder) => {
    const reset = (state: GuestCartState) => {
      state.merge = "idle";
    };
    builder.addCase(signedOut, reset).addCase(sessionExpired, reset);
  },
  selectors: {
    selectGuestItems: (s) => s.items,
    selectGuestMerge: (s) => s.merge,
  },
});

export const {
  guestItemAdded,
  guestQuantitySet,
  guestItemRemoved,
  guestCartSynced,
  guestMergeStarted,
  guestMergeSucceeded,
  guestMergeFailed,
} = guestCartSlice.actions;
export const { selectGuestItems, selectGuestMerge } = guestCartSlice.selectors;
export { STORAGE_KEY as GUEST_CART_STORAGE_KEY };
export default guestCartSlice;
