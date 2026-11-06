import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { PrefixInput } from "@/components/form/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/api/errors";
import type { DeliveryOption } from "@/types/api";
import {
  useCreateDeliveryOptionMutation,
  useDeleteDeliveryOptionMutation,
  useGetAdminDeliveryOptionsQuery,
  useUpdateDeliveryOptionMutation,
} from "../admin-api";
import { AdminHeading } from "../components/admin-layout";

const schema = z.object({
  name: z.string().trim().min(1, "Give it a name").max(60, "Keep it under 60 characters"),
  type: z.enum(["pickup", "delivery"]),
  fee: z.string().trim().regex(/^\d+$/, "Whole naira only, e.g. 5000").transform(Number),
  description: z.string().trim().max(300, "Keep it under 300 characters"),
  active: z.boolean(),
});
type FormIn = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export default function AdminDeliveryPage() {
  const { data: options = [], isLoading } = useGetAdminDeliveryOptionsQuery();
  const [adding, setAdding] = useState(false);
  const sorted = [...options].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <AdminHeading
        title="Delivery & pickup"
        description="Fees update at checkout straight away. Orders already placed keep the fee they were charged."
        action={
          <Button
            size="md"
            className="text-[15px]"
            onClick={() => setAdding(true)}
            disabled={adding}
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Add option
          </Button>
        }
      />
      {isLoading ? (
        <PageSpinner className="min-h-[30vh]" />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((o) => (
            <OptionCard key={o._id} option={o} />
          ))}
          {adding && (
            <OptionCard
              nextSortOrder={(sorted.at(-1)?.sortOrder ?? 0) + 1}
              onDone={() => setAdding(false)}
            />
          )}
        </div>
      )}
      <p className="text-[13px] leading-normal text-muted-foreground">
        Turn an option off to hide it from checkout without deleting it. Customers pay online by
        bank transfer before pickup or delivery. Put the store address in the Pickup option's
        description — customers see it at checkout.
      </p>
    </>
  );
}

/** One editable option. Without `option`, it's the "new option" form. */
function OptionCard({
  option,
  nextSortOrder = 0,
  onDone,
}: {
  option?: DeliveryOption;
  nextSortOrder?: number;
  onDone?: () => void;
}) {
  const uid = useId();
  const [create] = useCreateDeliveryOptionMutation();
  const [update] = useUpdateDeliveryOptionMutation();
  const [remove, { isLoading: deleting }] = useDeleteDeliveryOptionMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: option?.name ?? "",
      type: option?.type ?? "delivery",
      fee: String(option?.fee ?? ""),
      description: option?.description ?? "",
      active: option?.active ?? true,
    },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (option) {
        await update({ id: option._id, body: values }).unwrap();
        form.reset(form.getValues());
        toast.success(`${values.name} saved`);
      } else {
        await create({ ...values, sortOrder: nextSortOrder }).unwrap();
        toast.success(`${values.name} added`);
        onDone?.();
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  });

  const label = "flex flex-col gap-1.5 text-[13px] font-medium text-ink-2";
  const err = (m?: string) =>
    m && <span className="text-xs font-medium text-destructive">{m}</span>;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className={`${label} flex-[2_1_220px]`}>
          Name
          <Input
            {...form.register("name")}
            aria-invalid={!!errors.name}
            className="h-11 px-3 text-[15px]"
          />
          {err(errors.name?.message)}
        </label>
        <div className={`${label} flex-[1_1_140px]`}>
          <span id={`${uid}-type`}>Type</span>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-labelledby={`${uid}-type`}
                  className="w-full px-2.5 text-[15px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup (no address)</SelectItem>
                  <SelectItem value="delivery">Delivery (needs address)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <label className={`${label} flex-[1_1_140px]`}>
          Fee
          <PrefixInput
            prefix="₦"
            inputMode="numeric"
            invalid={!!errors.fee}
            className="h-11 [&>input]:font-mono [&>input]:text-[15px] [&>input]:font-semibold [&>span]:text-[15px] [&>span]:font-normal"
            {...form.register("fee")}
          />
          {err(errors.fee?.message)}
        </label>
        <Controller
          control={form.control}
          name="active"
          render={({ field }) => (
            <label className="flex h-11 flex-none items-center gap-2.5 text-sm text-ink-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              Shown at checkout
            </label>
          )}
        />
      </div>
      <label className={label}>
        Description shown to customers
        <Input
          {...form.register("description")}
          aria-invalid={!!errors.description}
          className="h-11 px-3 text-[15px]"
        />
        {err(errors.description?.message)}
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {option ? (
          <Button
            type="button"
            variant="link-destructive"
            className="h-11 text-sm"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
        ) : (
          <Button
            type="button"
            variant="link-muted"
            className="h-11 text-sm no-underline"
            onClick={onDone}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="ink"
          size="md"
          className="px-5 text-[15px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : option ? "Save changes" : "Add option"}
        </Button>
      </div>

      {option && (
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{option.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                Customers won't be able to choose it any more. Past orders keep their fee. If you
                might bring it back, turn off “Shown at checkout” instead.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() =>
                  remove(option._id)
                    .unwrap()
                    .then(() => toast(`${option.name} deleted`))
                    .catch((e) => toast.error(getErrorMessage(e)))
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </form>
  );
}
