import { describe, expect, it } from "vitest";
import { passwordChecks } from "./password-rules";
import { fieldForMessage } from "./server-errors";
import { safeRedirect } from "./use-sign-in-redirect";

describe("fieldForMessage", () => {
  const fields = ["userName", "email", "password"] as const;
  it("puts API messages under the field they're about", () => {
    expect(fieldForMessage("That username is taken. Please choose another", fields)).toBe(
      "userName",
    );
    expect(
      fieldForMessage("User Already exists with the same email! Please try again", fields),
    ).toBe("email");
    expect(fieldForMessage("Incorrect password! Please try again", fields)).toBe("password");
    expect(fieldForMessage("Too many attempts, try later", fields)).toBeNull();
  });

  it("tells the current password apart from a new one", () => {
    expect(
      fieldForMessage("Current password is incorrect", ["currentPassword", "newPassword"] as const),
    ).toBe("currentPassword");
  });
});

describe("passwordChecks", () => {
  it("scores the design's examples", () => {
    expect(passwordChecks("gadgets2026")).toEqual({ length: true, number: true, symbol: false });
    expect(passwordChecks("gadget")).toEqual({ length: false, number: false, symbol: false });
  });
});

describe("safeRedirect", () => {
  it("only allows same-site paths", () => {
    expect(safeRedirect("/checkout")).toBe("/checkout");
    expect(safeRedirect("//evil.com")).toBe("/");
    expect(safeRedirect("https://evil.com")).toBe("/");
    expect(safeRedirect(null, "/account")).toBe("/account");
  });
});
