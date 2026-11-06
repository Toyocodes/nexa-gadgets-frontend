import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Landmark, Lock, Plus, ShoppingBag } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import { paths } from "@/app/paths";
import { useAppSelector } from "@/app/store";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { selectUser } from "@/features/auth/auth-slice";
import { useCart } from "@/features/cart/use-cart";
import { getErrorMessage, serverErrorField } from "@/lib/api/errors";
import { effectivePrice, formatNaira, pluralize } from "@/lib/format";
import { PaymentCancelledError, payByTransfer } from "@/lib/paystack";
import { cn } from "@/lib/utils";
import type { Address, CartItem, DeliveryOption } from "@/types/api";
import {
  ADDRESS_FIELDS,
  addressSchema,
  formatPhone,
  toAddressForm,
  toAddressInput,
  type AddressFormValues,
} from "../address-schema";
import {
  useAddAddressMutation,
  useCreateOrderMutation,
  useGetAddressesQuery,
  useGetDeliveryOptionsQuery,
  useUpdateAddressMutation,
} from "../checkout-api";
import { AddressFields } from "../components/address-fields";
import { BackToCart, CheckoutHeader, CheckoutSteps } from "../components/checkout-chrome";
import { ChoiceCard } from "../components/choice-card";
import { zoneName } from "../delivery";

type AddressMode = { kind: "saved" } | { kind: "new" } | { kind: "edit"; address: Address };

export default function CheckoutPage() {
  const user = useAppSelector(selectUser)!;
  const navigate = useNavigate();
  const cart = useCart();
  const options = useGetDeliveryOptionsQuery();
  const addresses = useGetAddressesQuery(user ? user.id : skipToken);

  // `undefined` means "not chosen yet" — defaults are derived below, not synced in effects.
  const [chosenOptionId, setOptionId] = useState<string>();
  const [chosenAddressId, setAddressId] = useState<string>();
  const [chosenMode, setMode] = useState<AddressMode>({ kind: "saved" });
  // This order's notes per saved address; untouched addresses start from their stored notes.
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [step, setStep] = useState<0 | 1>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Re-use the order we already created if the customer closes Paystack and tries again.
  const pendingOrder = useRef<{ key: string; orderId: string; totalAmount: number } | null>(null);

  const [addAddress] = useAddAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [createOrder] = useCreateOrderMutation();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: toAddressForm(),
  });

  const savedAddresses = useMemo(() => addresses.data ?? [], [addresses.data]);
  // Defaults: first delivery option, first saved address, or the new-address form when there are none.
  const optionId = chosenOptionId ?? options.data?.[0]?._id;
  const addressId = chosenAddressId ?? savedAddresses[0]?._id;
  const mode: AddressMode =
    addresses.isSuccess && savedAddresses.length === 0 ? { kind: "new" } : chosenMode;
  const option = options.data?.find((o) => o._id === optionId);
  const needsAddress = option?.type === "delivery";
  const selectedAddress = savedAddresses.find((a) => a._id === addressId);
  const notes = selectedAddress
    ? (noteDrafts[selectedAddress._id] ?? selectedAddress.notes ?? "")
    : "";
  const setNotes = (value: string) =>
    selectedAddress && setNoteDrafts((d) => ({ ...d, [selectedAddress._id]: value }));
  const fee = option?.fee ?? 0;
  const total = cart.subtotal + fee;

  const cartKey = useMemo(
    () => cart.items.map((i) => `${i.productId}x${i.quantity}`).join(","),
    [cart.items],
  );

  if (cart.isLoading || options.isLoading)
    return (
      <Shell>
        <PageSpinner />
      </Shell>
    );
  if (cart.items.length === 0) {
    return (
      <Shell>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          body="Add something to your cart, then come back to check out."
          action={
            <Button asChild>
              <Link to={paths.products()}>Start shopping</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  /** Resolve the address and notes to deliver with, saving a new or edited address first. */
  async function resolveDelivery(): Promise<{ addressId: string; notes: string } | null> {
    if (!needsAddress) return null;
    if (mode.kind !== "saved") {
      let parsed: ReturnType<typeof toAddressInput> | null = null;
      await form.handleSubmit((v) => {
        parsed = toAddressInput(addressSchema.parse(v));
      })();
      const values = parsed as ReturnType<typeof toAddressInput> | null;
      if (!values) throw new Error("Please check the delivery address");
      const notes = values.notes ?? "";
      if (mode.kind === "edit") {
        await updateAddress({
          userId: user.id,
          addressId: mode.address._id,
          body: values,
        }).unwrap();
        return { addressId: mode.address._id, notes };
      }
      const res = await addAddress(values).unwrap();
      setAddressId(res.data._id);
      return { addressId: res.data._id, notes };
    }
    if (!selectedAddress) throw new Error("Please select a delivery address");
    return { addressId: selectedAddress._id, notes: notes.trim() };
  }

  async function pay() {
    if (!option) return setError("Please choose pickup or a delivery option");
    setError(null);
    setBusy(true);
    try {
      const delivery = await resolveDelivery();
      if (mode.kind !== "saved") setMode({ kind: "saved" });

      const key = JSON.stringify([option._id, delivery, cartKey]);
      let order = pendingOrder.current?.key === key ? pendingOrder.current : null;
      if (!order) {
        const res = await createOrder({
          deliveryOptionId: option._id,
          addressId: delivery?.addressId,
          notes: delivery?.notes,
        }).unwrap();
        order = { key, orderId: res.orderId, totalAmount: res.totalAmount };
        pendingOrder.current = order;
      }

      setStep(1);
      // Charge exactly what the server calculated.
      const reference = await payByTransfer({
        email: user.email,
        amount: order.totalAmount,
        orderId: order.orderId,
      });
      navigate(
        `${paths.paymentReturn}?reference=${encodeURIComponent(reference)}&order=${order.orderId}`,
        { replace: true },
      );
    } catch (err) {
      setStep(0);
      if (err instanceof PaymentCancelledError) {
        toast("Payment cancelled", {
          description: "Your order is saved. Pay whenever you're ready.",
        });
      } else {
        const message =
          err instanceof Error && !("status" in err) ? err.message : getErrorMessage(err);
        const field = mode.kind !== "saved" ? serverErrorField(err, ADDRESS_FIELDS) : null;
        if (field) form.setError(field, { message });
        setError(message);
        toast.error(message);
      }
    } finally {
      setBusy(false);
    }
  }

  const deliveryCaption =
    option?.type === "delivery"
      ? `Includes ${formatNaira(fee)} ${zoneName(option.name)} delivery · secured by Paystack`
      : "Pickup — no delivery fee · secured by Paystack";

  return (
    <Shell>
      <title>Checkout — Nexa Gadgets</title>
      <MobileSummary items={cart.items} total={total} subtotal={cart.subtotal} option={option} />

      <div className="mx-auto max-w-(--container-checkout) px-4 pt-5 pb-6 md:px-10 md:pt-8 md:pb-20">
        <BackToCart />
        <h1 className="mt-1 mb-2 hidden text-[40px] font-semibold tracking-[-0.04em] md:block">
          Checkout
        </h1>
        <CheckoutSteps current={step} />

        <div className="mt-5 flex flex-wrap items-start gap-8 md:mt-0">
          <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5 md:gap-6">
            {/* Contact */}
            <Card className="hidden items-center justify-between gap-3 md:flex md:flex-row md:flex-wrap">
              <div>
                <h2 className="text-base font-semibold">Contact</h2>
                <p className="mt-1 text-[15px] text-ink-2">Signed in as {user.email}</p>
              </div>
              <span className="text-[13px] text-muted-foreground">Receipts go to this email</span>
            </Card>

            {/* Delivery method */}
            <Card mobileFlat>
              <h2 className="text-[22px] font-semibold tracking-[-0.03em] md:text-base md:tracking-normal">
                <span className="md:hidden">Pickup or delivery?</span>
                <span className="hidden md:inline">How do you want to get your order?</span>
              </h2>
              <RadioGroup
                value={optionId}
                onValueChange={setOptionId}
                aria-label="Delivery method"
                className="gap-2.5"
              >
                {options.data?.map((o) => (
                  <DeliveryChoice key={o._id} option={o} selected={o._id === optionId} />
                ))}
              </RadioGroup>
              {options.isError && (
                <p className="text-sm text-destructive">{getErrorMessage(options.error)}</p>
              )}
            </Card>

            {/* Address — delivery only */}
            {needsAddress && (
              <Card mobileFlat>
                <h2 className="text-lg font-semibold tracking-[-0.02em] md:text-base md:tracking-normal">
                  Delivery address
                </h2>
                {savedAddresses.length > 0 && (
                  <RadioGroup
                    aria-label="Choose a saved address"
                    className="gap-3"
                    value={mode.kind === "new" ? "new" : addressId}
                    onValueChange={(v) => {
                      if (v === "new") {
                        form.reset(toAddressForm());
                        setMode({ kind: "new" });
                      } else {
                        setAddressId(v);
                        setMode({ kind: "saved" });
                      }
                    }}
                  >
                    {savedAddresses.map((a) => {
                      const selected = mode.kind !== "new" && a._id === addressId;
                      return (
                        <ChoiceCard
                          key={a._id}
                          value={a._id}
                          selected={selected}
                          className="md:p-[18px]"
                        >
                          <span className="flex justify-between gap-2">
                            <span className="text-[15px] font-semibold">
                              {a.label || a.address}
                            </span>
                            {selected && mode.kind === "saved" && (
                              <button
                                type="button"
                                className="text-[13px] font-medium text-primary hover:text-primary-hover"
                                onClick={(e) => {
                                  e.preventDefault();
                                  form.reset(toAddressForm(a));
                                  setMode({ kind: "edit", address: a });
                                }}
                              >
                                Edit
                              </button>
                            )}
                          </span>
                          <span className="text-sm leading-normal text-ink-2">
                            {a.label && (
                              <>
                                {a.address}
                                <br />
                              </>
                            )}
                            {[a.city, a.pincode].filter(Boolean).join(", ")}
                            <span className="md:hidden"> · </span>
                            <br className="hidden md:block" />
                            {formatPhone(a.phone)}
                          </span>
                        </ChoiceCard>
                      );
                    })}
                    <ChoiceCard value="new" selected={mode.kind === "new"} className="md:hidden">
                      <span className="text-[15px] font-semibold">Use a new address</span>
                    </ChoiceCard>
                  </RadioGroup>
                )}

                {mode.kind === "saved" ? (
                  <>
                    <Button
                      variant="dashed"
                      size="lg"
                      className="hidden text-[15px] md:inline-flex"
                      onClick={() => {
                        form.reset(toAddressForm());
                        setMode({ kind: "new" });
                      }}
                    >
                      <Plus size={16} strokeWidth={2} aria-hidden="true" />
                      Add a new address
                    </Button>
                    {selectedAddress && (
                      <label className="flex flex-col gap-1.5 text-sm font-medium">
                        <span>
                          Delivery notes for this order{" "}
                          <span className="font-normal text-muted-foreground">
                            Optional — gate code, landmark, best time to call
                          </span>
                        </span>
                        <Textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          maxLength={300}
                          className="resize-y"
                        />
                      </label>
                    )}
                  </>
                ) : (
                  <section
                    aria-label={mode.kind === "edit" ? "Edit address" : "New address"}
                    className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-4 md:border-0 md:p-0"
                  >
                    <AddressFields form={form} />
                    <p className="text-[13px] text-muted-foreground">
                      {mode.kind === "edit"
                        ? "Changes are saved to this address."
                        : "We'll save this address to your account for next time."}
                    </p>
                    {savedAddresses.length > 0 && (
                      <Button
                        variant="link"
                        className="self-start text-sm"
                        onClick={() => setMode({ kind: "saved" })}
                      >
                        Cancel
                      </Button>
                    )}
                  </section>
                )}
              </Card>
            )}

            {/* Payment */}
            <Card className="gap-1.5 p-4 md:gap-3 md:p-6">
              <h2 className="text-[15px] font-semibold md:text-base">
                <span className="md:hidden">Payment: bank transfer</span>
                <span className="hidden md:inline">Payment</span>
              </h2>
              <p className="text-[13px] leading-normal text-muted-foreground md:hidden">
                Paystack shows a one-time account number. Transfer the exact amount and your order
                confirms automatically.
              </p>
              <div className="hidden items-start gap-3.5 rounded-lg border-2 border-primary bg-primary-tint px-[18px] py-4 md:flex">
                <Landmark
                  size={22}
                  strokeWidth={1.8}
                  className="flex-none text-primary"
                  aria-hidden="true"
                />
                <span className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold">Bank transfer</span>
                  <span className="text-sm leading-normal text-ink-2">
                    Paystack gives you a one-time account number. Transfer the exact amount from any
                    Nigerian bank app and your order confirms automatically.
                  </span>
                </span>
              </div>
            </Card>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-warning-soft px-4 py-3 text-sm font-medium text-warning"
              >
                {error}
              </p>
            )}
          </div>

          {/* Desktop summary */}
          <aside
            aria-label="Order summary"
            className="hidden min-w-0 flex-[1_1_340px] flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:flex"
          >
            <h2 className="text-base font-semibold">Order summary</h2>
            <SummaryLines items={cart.items} />
            <Totals subtotal={cart.subtotal} option={option} total={total} />
            <Button size="xl" disabled={busy || !option} onClick={pay}>
              <Lock size={18} strokeWidth={1.8} aria-hidden="true" />
              {busy ? (
                "Opening Paystack…"
              ) : (
                <>
                  Pay <span className="font-mono">{formatNaira(total)}</span> by transfer
                </>
              )}
            </Button>
            <p className="text-center text-[13px] leading-normal text-muted-foreground">
              A secure Paystack window shows the account to transfer to. Your order is confirmed as
              soon as the transfer lands.
            </p>
          </aside>
        </div>
      </div>

      {/* Mobile pay bar */}
      <div className="sticky bottom-0 z-30 flex flex-col gap-2 border-t border-border bg-card px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] md:hidden">
        <Button size="xl" disabled={busy || !option} onClick={pay}>
          <Lock size={18} strokeWidth={1.8} aria-hidden="true" />
          {busy ? (
            "Opening Paystack…"
          ) : (
            <>
              Pay <span className="font-mono">{formatNaira(total)}</span> by transfer
            </>
          )}
        </Button>
        <span className="text-center text-xs text-muted-foreground">{deliveryCaption}</span>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <CheckoutHeader />
      {children}
    </div>
  );
}

function Card({
  children,
  className,
  mobileFlat,
}: {
  children: React.ReactNode;
  className?: string;
  mobileFlat?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 md:rounded-2xl md:border md:border-border md:bg-card md:p-6",
        !mobileFlat && "rounded-2xl border border-border bg-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

function DeliveryChoice({ option, selected }: { option: DeliveryOption; selected: boolean }) {
  return (
    <ChoiceCard value={option._id} selected={selected}>
      <span className="flex justify-between gap-2">
        <span className="text-[15px] font-semibold">
          <span className="md:hidden">{zoneName(option.name)}</span>
          <span className="hidden md:inline">{option.name}</span>
        </span>
        <span className="font-mono text-[15px] font-semibold">{formatNaira(option.fee)}</span>
      </span>
      {option.description && (
        <span
          className={cn(
            "text-[13px] leading-normal text-muted-foreground md:text-sm",
            // On phones, zone descriptions repeat the name; pickup's carries the address.
            option.type === "delivery" && "hidden md:block",
          )}
        >
          {option.description}
        </span>
      )}
    </ChoiceCard>
  );
}

function SummaryLines({ items }: { items: CartItem[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {items.map((item) => {
        const unit = effectivePrice(item);
        return (
          <li key={item.productId} className="flex items-center gap-3">
            <span className="relative flex-none">
              <ProductImage
                src={item.image}
                alt=""
                iconSize={28}
                iconStroke={1.2}
                className="size-14 rounded-md"
              />
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-semibold text-ink-foreground">
                {item.quantity}
              </span>
            </span>
            <span className="min-w-0 flex-1 text-sm leading-[1.35]">{item.title}</span>
            <span className="font-mono text-sm font-semibold">
              {formatNaira(unit * item.quantity)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Totals({
  subtotal,
  option,
  total,
}: {
  subtotal: number;
  option?: DeliveryOption;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-border pt-4 text-[15px] text-ink-2">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span className="font-mono">{formatNaira(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>
          {option
            ? option.type === "pickup"
              ? "Pickup"
              : `Delivery · ${zoneName(option.name)}`
            : "Delivery"}
        </span>
        <span className="font-mono">{option ? formatNaira(option.fee) : "—"}</span>
      </div>
      <div className="flex justify-between pt-2 text-lg font-semibold text-foreground">
        <span>Total</span>
        <span className="font-mono">{formatNaira(total)}</span>
      </div>
    </div>
  );
}

function MobileSummary(props: {
  items: CartItem[];
  subtotal: number;
  total: number;
  option?: DeliveryOption;
}) {
  const [open, setOpen] = useState(false);
  const count = props.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <div className="border-b border-border bg-muted md:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-full items-center justify-between px-4 text-foreground"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-primary">
          {open ? "Hide" : "Show"} order summary ({pluralize(count, "item")})
          <ChevronDown
            size={16}
            strokeWidth={2}
            className={cn("transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </span>
        <span className="font-mono text-base font-semibold">{formatNaira(props.total)}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-4 px-4 pt-2 pb-5">
          <SummaryLines items={props.items} />
          <Totals subtotal={props.subtotal} option={props.option} total={props.total} />
        </div>
      )}
    </div>
  );
}
