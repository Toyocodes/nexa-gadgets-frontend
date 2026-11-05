import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "@/types/api";

export interface AuthState {
  user: SessionUser | null;
  /** "checking" until the one-time session check on load resolves. */
  status: "checking" | "authenticated" | "guest";
  /** Set when a request came back 401 mid-session, so we can explain the redirect. */
  expired: boolean;
}

const initialState: AuthState = { user: null, status: "checking", expired: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<SessionUser>) {
      state.user = action.payload;
      state.status = "authenticated";
      state.expired = false;
    },
    userUpdated(state, action: PayloadAction<Partial<SessionUser>>) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    signedOut(state) {
      state.user = null;
      state.status = "guest";
      state.expired = false;
    },
    sessionExpired(state) {
      if (state.status === "authenticated") state.expired = true;
      state.user = null;
      state.status = "guest";
    },
  },
  selectors: {
    selectUser: (s) => s.user,
    selectAuthStatus: (s) => s.status,
    selectIsAdmin: (s) => s.user?.role === "admin",
    selectSessionExpired: (s) => s.expired,
  },
});

export const { signedIn, userUpdated, signedOut, sessionExpired } = authSlice.actions;
export const { selectUser, selectAuthStatus, selectIsAdmin, selectSessionExpired } =
  authSlice.selectors;
export default authSlice;
