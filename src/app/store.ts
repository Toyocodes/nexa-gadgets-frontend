import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";
import authSlice from "@/features/auth/auth-slice";
import cartUiSlice from "@/features/cart/cart-ui-slice";
import guestCartSlice, {
  GUEST_CART_STORAGE_KEY,
  guestCartSynced,
  parseGuestCart,
  saveGuestCart,
  selectGuestItems,
} from "@/features/cart/guest-cart-slice";
import { baseApi } from "@/lib/api/base-api";

/**
 * Server state lives in RTK Query (baseApi); Redux slices only hold what the
 * server doesn't know: who is signed in, whether the cart drawer is open, and
 * what a guest has added before they have an account.
 */
const rootReducer = combineSlices(baseApi, authSlice, cartUiSlice, guestCartSlice);

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
}

export const store = makeStore();
// Refetch stale data when the tab regains focus or the network comes back.
setupListeners(store.dispatch);

// Keep a guest's cart across reloads, and in step between tabs.
let savedGuestItems = selectGuestItems(store.getState());
store.subscribe(() => {
  const items = selectGuestItems(store.getState());
  if (items === savedGuestItems) return;
  savedGuestItems = items;
  saveGuestCart(items);
});
window.addEventListener("storage", (e) => {
  if (e.key !== GUEST_CART_STORAGE_KEY) return;
  const items = parseGuestCart(e.newValue);
  savedGuestItems = items; // came from storage, so there's no need to write it back
  store.dispatch(guestCartSynced(items));
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
