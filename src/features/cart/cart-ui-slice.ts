import { createSlice } from "@reduxjs/toolkit";

/** The cart drawer can be opened from the header, product cards, "Buy again"… */
const cartUiSlice = createSlice({
  name: "cartUi",
  initialState: { open: false },
  reducers: {
    cartOpened(state) {
      state.open = true;
    },
    cartClosed(state) {
      state.open = false;
    },
  },
  selectors: { selectCartOpen: (s) => s.open },
});

export const { cartOpened, cartClosed } = cartUiSlice.actions;
export const { selectCartOpen } = cartUiSlice.selectors;
export default cartUiSlice;
