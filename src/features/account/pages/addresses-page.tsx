import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAppSelector } from "@/app/store";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSpinner } from "@/components/feedback/page-spinner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { selectUser } from "@/features/auth/auth-slice";
import {
  addressSchema,
  formatPhone,
  toAddressForm,
  toAddressInput,
  type AddressFormValues,
} from "@/features/checkout/address-schema";
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from "@/features/checkout/checkout-api";
import { AddressFields } from "@/features/checkout/components/address-fields";
import { getErrorMessage } from "@/lib/api/errors";
import type { Address } from "@/types/api";

export default function AddressesPage() {
  const user = useAppSelector(selectUser)!;
  const { data: addresses = [], isLoading } = useGetAddressesQuery(user.id);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);
  const [deleteAddress, { isLoading: removing }] = useDeleteAddressMutation();

  return (
    <>
      <title>Addresses — Nexa Gadgets</title>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] md:text-4xl">Addresses</h1>
        {addresses.length > 0 && (
          <Button size="md" onClick={() => setEditing("new")}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" /> Add address
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageSpinner className="min-h-[30vh]" />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          body="Save a delivery address for one-tap checkout."
          action={<Button onClick={() => setEditing("new")}>Add an address</Button>}
        />
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a._id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div>
                <div className="text-[15px] font-semibold">{a.address}</div>
                <div className="mt-1 text-sm leading-normal text-ink-2">
                  {[a.city, a.pincode].filter(Boolean).join(", ")}
                  <br />
                  {formatPhone(a.phone)}
                </div>
                {a.notes && (
                  <div className="mt-1 text-[13px] text-muted-foreground">Notes: {a.notes}</div>
                )}
              </div>
              <div className="flex gap-4">
                <Button variant="link" className="text-sm" onClick={() => setEditing(a)}>
                  Edit
                </Button>
                <Button
                  variant="link-destructive"
                  className="text-sm"
                  onClick={() => setDeleting(a)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <AddressDialog
          userId={user.id}
          address={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>{deleting?.address}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                try {
                  await deleteAddress({ userId: user.id, addressId: deleting._id }).unwrap();
                  toast("Address deleted");
                } catch (e) {
                  toast.error(getErrorMessage(e));
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AddressDialog({
  userId,
  address,
  onClose,
}: {
  userId: string;
  address?: Address;
  onClose: () => void;
}) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: toAddressForm(address),
  });
  const [addAddress] = useAddAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const body = toAddressInput(addressSchema.parse(values));
    try {
      if (address) await updateAddress({ userId, addressId: address._id, body }).unwrap();
      else await addAddress(body).unwrap();
      toast.success(address ? "Address updated" : "Address saved");
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-2xl sm:max-w-[480px]">
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          <DialogHeader>
            <DialogTitle className="text-xl tracking-[-0.02em]">
              {address ? "Edit address" : "New address"}
            </DialogTitle>
            <DialogDescription>
              Used for Lagos delivery. Pickup orders don't need one.
            </DialogDescription>
          </DialogHeader>
          <AddressFields form={form} />
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save address"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
