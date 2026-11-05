/**
 * The API returns one human-readable `message` and no field name. Put it
 * under the input it's about — "That username is taken" under Username,
 * "Incorrect password!" under Password — falling back to a form-level alert.
 * (A `field` key in the API's error responses would make this exact.)
 */
export function fieldForMessage<F extends string>(message: string, fields: readonly F[]): F | null {
  const m = message.toLowerCase();
  const match = (f: string) =>
    (f === "userName" && /user ?name/.test(m)) ||
    (f === "email" && /e-?mail|user already exists|doesn't exist|not found/.test(m)) ||
    (f === "password" && /password/.test(m) && !/current password/.test(m)) ||
    (f === "currentPassword" && /current password/.test(m)) ||
    (f === "newPassword" && /password/.test(m) && !/current/.test(m));
  return fields.find(match) ?? null;
}
