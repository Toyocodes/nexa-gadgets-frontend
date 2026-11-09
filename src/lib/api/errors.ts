import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type ApiError = FetchBaseQueryError | SerializedError | undefined | null;

function isFetchError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

/**
 * The API's messages are written for end users ("Only 3 of AirPods left in
 * stock"), so show them as-is. Fall back to something useful for network
 * failures instead of an empty toast.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  const err = error as ApiError;
  if (!err) return fallback;
  if (isFetchError(err)) {
    if (err.status === "FETCH_ERROR")
      return "We couldn't reach the server. Check your connection and try again.";
    const data = err.data as { message?: unknown } | undefined;
    if (data && typeof data.message === "string" && data.message) return data.message;
    return fallback;
  }
  return err.message || fallback;
}

/**
 * The input an API error is about, when it's one the form has. `source` is a
 * thrown error, or a response body that carries a `field`.
 */
export function serverErrorField<F extends string>(
  source: unknown,
  fields: readonly F[],
): F | null {
  const body = isFetchError(source) ? source.data : source;
  const field = (body as { field?: unknown } | null | undefined)?.field;
  return fields.find((f) => f === field) ?? null;
}

export function errorStatus(error: unknown) {
  return isFetchError(error) ? error.status : undefined;
}

/** Auth endpoints are rate-limited per IP; the UI briefly disables submit on 429. */
export const isRateLimited = (error: unknown) => errorStatus(error) === 429;
