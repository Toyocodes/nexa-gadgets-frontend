import { z } from "zod";
import type { Address, AddressInput } from "@/types/api";

/** Nigerian mobile number typed after the fixed +234 prefix: "801 234 5678" or "0801 234 5678". */
const nationalNumber = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^0?[789]\d{9}$/.test(v), "Enter a Nigerian mobile number, like 801 234 5678");

export const addressSchema = z.object({
  address: z.string().trim().min(3, "Enter the street address"),
  city: z.string().trim().min(2, "Enter the city"),
  pincode: z.string().trim().max(12).optional(),
  phone: nationalNumber,
  notes: z.string().trim().max(300).optional(),
});

export type AddressFormValues = z.input<typeof addressSchema>;

/** Form values → API body. The API stores the full international number. */
export function toAddressInput(values: z.output<typeof addressSchema>): AddressInput {
  return {
    address: values.address,
    city: values.city,
    pincode: values.pincode ?? "",
    notes: values.notes ?? "",
    phone: `+234${values.phone.replace(/^0/, "")}`,
  };
}

/** API record → form values (strip +234 so it shows after the fixed prefix). */
export function toAddressForm(a?: Address): AddressFormValues {
  return {
    address: a?.address ?? "",
    city: a?.city ?? "Lagos",
    pincode: a?.pincode ?? "",
    phone: (a?.phone ?? "").replace(/^\+?234/, "").replace(/^0/, ""),
    notes: a?.notes ?? "",
  };
}

/** "+2348012345678" → "+234 801 234 5678" for display. */
export function formatPhone(phone: string) {
  const m = phone.replace(/\s/g, "").match(/^\+?234(\d{3})(\d{3})(\d{4})$/);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : phone;
}
