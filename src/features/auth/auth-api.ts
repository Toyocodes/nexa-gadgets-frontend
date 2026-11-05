import { baseApi } from "@/lib/api/base-api";
import type { ApiEnvelope, AuthResponse, MessageResponse, Profile, SessionUser } from "@/types/api";
import { signedIn, signedOut, userUpdated } from "./auth-slice";

type Dispatch = (action: unknown) => unknown;

/** Store the user when an auth call succeeds, and refresh per-user data. */
async function syncSession(queryFulfilled: Promise<{ data: AuthResponse }>, dispatch: Dispatch) {
  try {
    const { data } = await queryFulfilled;
    if (data.success && data.user) {
      dispatch(signedIn(data.user));
      dispatch(baseApi.util.invalidateTags(["Cart", "Wishlist", "Address", "Order", "Profile"]));
    }
  } catch {
    /* the form shows the error */
  }
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkAuth: build.query<{ success: boolean; user: SessionUser }, void>({
      query: () => "/auth/check-auth",
      providesTags: ["Session"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(data.user ? signedIn(data.user) : signedOut());
        } catch {
          dispatch(signedOut());
        }
      },
    }),

    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      onQueryStarted: (_, { dispatch, queryFulfilled }) => syncSession(queryFulfilled, dispatch),
    }),

    register: build.mutation<
      AuthResponse,
      { userName: string; email: string; password: string; marketingOptIn: boolean }
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      onQueryStarted: (_, { dispatch, queryFulfilled }) => syncSession(queryFulfilled, dispatch),
    }),

    verifyMagicLink: build.mutation<AuthResponse, string>({
      query: (token) => ({ url: "/auth/magic-link/verify", method: "POST", body: { token } }),
      onQueryStarted: (_, { dispatch, queryFulfilled }) => syncSession(queryFulfilled, dispatch),
    }),

    requestMagicLink: build.mutation<MessageResponse, string>({
      query: (email) => ({ url: "/auth/magic-link", method: "POST", body: { email } }),
    }),

    logout: build.mutation<MessageResponse, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          // Even if the request fails, drop everything we cached for this user.
          dispatch(signedOut());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    forgotPassword: build.mutation<MessageResponse, string>({
      query: (email) => ({ url: "/auth/forgot-password", method: "POST", body: { email } }),
    }),

    resetPassword: build.mutation<MessageResponse, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: "PUT",
        body: { password },
      }),
    }),

    getProfile: build.query<Profile, void>({
      query: () => "/auth/me",
      transformResponse: (res: ApiEnvelope<Profile>) => res.data,
      providesTags: ["Profile"],
    }),

    updateProfile: build.mutation<
      AuthResponse,
      Partial<{ userName: string; email: string; currentPassword: string; marketingOptIn: boolean }>
    >({
      query: (body) => ({ url: "/auth/me", method: "PUT", body }),
      invalidatesTags: ["Profile"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // The header greeting reads auth.user, so update it right away.
          if (data.user) dispatch(userUpdated(data.user));
        } catch {
          /* shown inline */
        }
      },
    }),

    changePassword: build.mutation<
      MessageResponse,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/auth/change-password", method: "PUT", body }),
    }),
  }),
});

export const {
  useCheckAuthQuery,
  useLoginMutation,
  useRegisterMutation,
  useVerifyMagicLinkMutation,
  useRequestMagicLinkMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
