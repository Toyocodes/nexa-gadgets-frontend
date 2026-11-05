import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Field, PrefixInput } from "@/components/form/field";
import { fieldAria } from "@/components/form/field-aria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { BRANDS, CATEGORIES } from "@/config/catalog";
import { getErrorMessage } from "@/lib/api/errors";
import { productImages } from "@/lib/format";
import type { Product, ProductInput } from "@/types/api";
import { useAddProductMutation, useEditProductMutation } from "../admin-api";
import { GalleryUploader } from "./gallery-uploader";

const naira = (msg: string) => z.string().trim().regex(/^\d+$/, msg).transform(Number);

const schema = z
  .object({
    images: z.array(z.string()).min(1, "Add at least one photo"),
    title: z.string().trim().min(3, "Give the product a name"),
    description: z.string().trim().min(10, "Add a short description"),
    category: z.string().min(1, "Choose a category"),
    brand: z.string().min(1, "Choose a brand"),
    price: naira("Whole naira, e.g. 250000"),
    salePrice: z
      .string()
      .trim()
      .regex(/^\d*$/, "Whole naira, or leave empty")
      .transform((v) => (v ? Number(v) : 0)),
    totalStock: naira("Whole number, 0 or more"),
    specs: z.array(z.object({ label: z.string().trim(), value: z.string().trim() })),
  })
  .refine((v) => v.salePrice === 0 || v.salePrice < v.price, {
    path: ["salePrice"],
    message: "Sale price must be lower than the price",
  });

type In = z.input<typeof schema>;
type Out = z.output<typeof schema>;

const toForm = (p?: Product): In => ({
  images: p ? productImages(p) : [],
  title: p?.title ?? "",
  description: p?.description ?? "",
  category: p?.category ?? "",
  brand: p?.brand ?? "",
  price: p ? String(p.price) : "",
  salePrice: p?.salePrice ? String(p.salePrice) : "",
  totalStock: p ? String(p.totalStock ?? 0) : "",
  specs: p?.specs?.length ? p.specs : [{ label: "", value: "" }],
});

interface Props {
  open: boolean;
  product?: Product;
  onOpenChange: (open: boolean) => void;
}

export function ProductFormSheet({ open, product, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-[560px]">
        <div className="sticky top-0 z-10 border-b border-border bg-card px-6 py-5">
          <SheetTitle className="text-xl font-semibold tracking-[-0.02em]">
            {product ? "Edit product" : "Add new product"}
          </SheetTitle>
          <SheetDescription>
            {product ? product.title : "Photos, details, price and stock."}
          </SheetDescription>
        </div>
        {/* Remount per product so the form starts from that product's values. */}
        {open && (
          <ProductForm
            key={product?._id ?? "new"}
            product={product}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProductForm({ product, onDone }: { product?: Product; onDone: () => void }) {
  const [add] = useAddProductMutation();
  const [edit] = useEditProductMutation();
  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: toForm(product),
  });
  const specs = useFieldArray({ control: form.control, name: "specs" });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    const body: ProductInput = {
      ...v,
      // Empty rows are dropped server-side too; drop them here so the payload is clean.
      specs: v.specs.filter((s) => s.label && s.value),
    };
    try {
      if (product) await edit({ id: product._id, body }).unwrap();
      else await add(body).unwrap();
      toast.success(product ? "Product updated" : "Product added");
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 px-6 py-6">
      <Field
        id="images"
        label="Photos"
        error={errors.images?.message}
        hint="The first photo is the cover. Use the arrows to reorder."
      >
        <Controller
          control={form.control}
          name="images"
          render={({ field }) => <GalleryUploader value={field.value} onChange={field.onChange} />}
        />
      </Field>

      <Field id="title" label="Title" error={errors.title?.message}>
        <Input
          {...form.register("title")}
          {...fieldAria("title", errors.title?.message)}
          placeholder="e.g. Apple iPhone 13 Pro Max"
        />
      </Field>

      <Field
        id="description"
        label="Description"
        error={errors.description?.message}
        hint="Shown on the product page when there are no specs."
      >
        <Textarea
          {...form.register("description")}
          {...fieldAria("description", errors.description?.message, true)}
          rows={4}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          form={form}
          name="category"
          label="Category"
          items={CATEGORIES}
          error={errors.category?.message}
        />
        <SelectField
          form={form}
          name="brand"
          label="Brand"
          items={BRANDS}
          error={errors.brand?.message}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field id="price" label="Price" error={errors.price?.message}>
          <PrefixInput
            prefix="₦"
            inputMode="numeric"
            invalid={!!errors.price}
            {...form.register("price")}
            {...fieldAria("price", errors.price?.message)}
          />
        </Field>
        <Field id="salePrice" label="Sale price" error={errors.salePrice?.message}>
          <PrefixInput
            prefix="₦"
            inputMode="numeric"
            placeholder="—"
            invalid={!!errors.salePrice}
            {...form.register("salePrice")}
            {...fieldAria("salePrice", errors.salePrice?.message)}
          />
        </Field>
        <Field id="totalStock" label="In stock" error={errors.totalStock?.message}>
          <Input
            inputMode="numeric"
            {...form.register("totalStock")}
            {...fieldAria("totalStock", errors.totalStock?.message)}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-1 text-sm font-medium">Specifications</legend>
        <p className="-mt-1 text-[13px] text-muted-foreground">
          The first four become chips under the price (e.g. Display · 6.7″, RAM · 6GB). All rows
          appear in the spec table.
        </p>
        {specs.fields.map((f, i) => (
          <div key={f.id} className="flex gap-2">
            <Input
              aria-label={`Spec ${i + 1} label`}
              placeholder="Label, e.g. RAM"
              className="h-11 flex-1"
              {...form.register(`specs.${i}.label`)}
            />
            <Input
              aria-label={`Spec ${i + 1} value`}
              placeholder="Value, e.g. 6GB"
              className="h-11 flex-1"
              {...form.register(`specs.${i}.value`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove spec ${i + 1}`}
              onClick={() => specs.remove(i)}
            >
              <X size={16} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="dashed"
          size="md"
          onClick={() => specs.append({ label: "", value: "" })}
        >
          <Plus size={16} aria-hidden="true" /> Add spec
        </Button>
      </fieldset>

      <div className="sticky bottom-0 -mx-6 mt-2 flex justify-end gap-2 border-t border-border bg-card px-6 py-4">
        <Button type="button" variant="outline" size="md" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="md" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : product ? "Save changes" : "Add product"}
        </Button>
      </div>
    </form>
  );
}

function SelectField({
  form,
  name,
  label,
  items,
  error,
}: {
  form: ReturnType<typeof useForm<In, unknown, Out>>;
  name: "category" | "brand";
  label: string;
  items: readonly { id: string; label: string }[];
  error?: string;
}) {
  return (
    <Field id={name} label={label} error={error}>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={name} aria-invalid={!!error} className="h-12 w-full">
              <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
              {items.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  );
}
