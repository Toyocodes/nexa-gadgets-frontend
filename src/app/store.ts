import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";
import authSlice from "@/features/auth/auth-slice";
import cartUiSlice from "@/features/cart/cart-ui-slice";
import { baseApi } from "@/lib/api/base-api";

/**
 * Server state lives in RTK Query (baseApi); Redux slices only hold what the
 * server doesn't know: who is signed in and whether the cart drawer is open.
 */
const rootReducer = combineSlices(baseApi, authSlice, cartUiSlice);

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

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
