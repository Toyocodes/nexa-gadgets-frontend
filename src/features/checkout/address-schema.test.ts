import { describe, expect, it } from "vitest";
import { addressSchema, toAddressInput } from "./address-schema";

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
