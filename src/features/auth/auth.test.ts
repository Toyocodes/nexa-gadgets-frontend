import { describe, expect, it } from "vitest";
import { passwordChecks } from "./password-rules";
import { safeRedirect } from "./use-sign-in-redirect";

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
