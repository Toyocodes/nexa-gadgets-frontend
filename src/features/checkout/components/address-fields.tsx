import { useId } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Field, PrefixInput } from "@/components/form/field";
import { fieldAria } from "@/components/form/field-aria";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AddressFormValues } from "../address-schema";

/** Street, city, postal code, phone (+234) and notes — used at checkout and in Account › Addresses. */
export function AddressFields({
  form,
  showNotes = true,
}: {
  form: UseFormReturn<AddressFormValues>;
  showNotes?: boolean;
}) {
  const uid = useId();
  const { register, formState } = form;
  const e = formState.errors;
  const id = (name: string) => `${uid}-${name}`;

  return (
    <div className="flex flex-col gap-3.5">
      <Field id={id("address")} label="Street address" error={e.address?.message}>
        <Input
          {...register("address")}
          {...fieldAria(id("address"), e.address?.message)}
          autoComplete="street-address"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field id={id("city")} label="City" error={e.city?.message}>
          <Input
            {...register("city")}
            {...fieldAria(id("city"), e.city?.message)}
            autoComplete="address-level2"
          />
        </Field>
        <Field id={id("pincode")} label="Postal code" error={e.pincode?.message}>
          <Input
            {...register("pincode")}
            {...fieldAria(id("pincode"), e.pincode?.message)}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Optional"
          />
        </Field>
      </div>
      <Field
        id={id("phone")}
        label="Phone number"
        error={e.phone?.message}
        hint="The rider calls this number on delivery day"
      >
        <PrefixInput
          prefix="+234"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="801 234 5678"
          invalid={!!e.phone}
          {...register("phone")}
          {...fieldAria(id("phone"), e.phone?.message, true)}
        />
      </Field>
      {showNotes && (
        <Field
          id={id("notes")}
          label={
            <>
              Delivery notes{" "}
              <span className="font-normal text-muted-foreground">
                Optional — landmark, gate code
              </span>
            </>
          }
          error={e.notes?.message}
        >
          <Textarea
            {...register("notes")}
            {...fieldAria(id("notes"), e.notes?.message)}
            rows={2}
            className="resize-y"
          />
        </Field>
      )}
    </div>
  );
}
