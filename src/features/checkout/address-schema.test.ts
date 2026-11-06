import { describe, expect, it } from "vitest";
import { addressSchema, toAddressInput } from "./address-schema";

describe("address labels", () => {
  const base = { address: "14 Adeniyi Jones Avenue", city: "Lagos", phone: "8012345678" };
  it("is optional, and trims what's typed", () => {
    expect(toAddressInput(addressSchema.parse(base)).label).toBe("");
    expect(toAddressInput(addressSchema.parse({ ...base, label: " Home " })).label).toBe("Home");
  });
  it("matches the API's 30-character limit", () => {
    expect(addressSchema.safeParse({ ...base, label: "x".repeat(30) }).success).toBe(true);
    expect(addressSchema.safeParse({ ...base, label: "x".repeat(31) }).success).toBe(false);
  });
});

describe("address phone numbers", () => {
  const base = { address: "14 Adeniyi Jones Avenue", city: "Lagos" };
  it("accepts numbers typed after the +234 prefix and stores them in full", () => {
    for (const phone of ["801 234 5678", "08012345678", "9012345678"]) {
      const parsed = addressSchema.parse({ ...base, phone });
      expect(toAddressInput(parsed).phone).toMatch(/^\+234[789]\d{9}$/);
    }
  });
  it("rejects numbers that aren't Nigerian mobiles", () => {
    expect(addressSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
  });
});
