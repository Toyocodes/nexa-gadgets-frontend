import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";
import { paths } from "@/app/paths";
import heroIphone from "@/assets/hero-iphone.png";
import { Field } from "@/components/form/field";
import { fieldAria } from "@/components/form/field-aria";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getErrorMessage, isRateLimited, serverErrorField } from "@/lib/api/errors";
import { useRegisterMutation } from "../auth-api";
import { AuthHeading, AuthShell } from "../components/auth-shell";
import { PasswordInput, PasswordStrength } from "../components/password-input";
import { useCooldown } from "../use-cooldown";

const schema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters")
    .max(30, "Keep it under 30 characters")
    .regex(/^[\w.-]+$/, "Letters, numbers, dots, dashes and underscores only"),
  email: z.email("Enter a full email address, like name@example.com"),
  // The server's only rule; the meter's other hints are guidance.
  password: z.string().min(8, "Use at least 8 characters"),
  marketingOptIn: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function SignUpPage() {
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? undefined;
  const [register, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const cooldown = useCooldown();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { userName: "", email: "", password: "", marketingOptIn: false },
  });
  const { errors } = form.formState;
  const password = useWatch({ control: form.control, name: "password" });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await register(values).unwrap();
      // Taken username/email come back as 200 { success: false }.
      if (!res.success) {
        const field = serverErrorField(res, ["userName", "email", "password"] as const);
        if (field) form.setError(field, { message: res.message });
        else setFormError(res.message);
      }
      // Success signs the user in; the guard sends them on (to their account by default).
    } catch (err) {
      if (isRateLimited(err)) cooldown.start();
      const message = getErrorMessage(err);
      const field = serverErrorField(err, ["userName", "email", "password"] as const);
      if (field) form.setError(field, { message });
      else setFormError(message);
    }
  });

  return (
    <AuthShell
      tone="dark"
      image={heroIphone}
      imageAlt="Gold iPhone 13 Pro"
      imageWidth={400}
      panel={
        <>
          <h2 className="max-w-[420px] text-[28px] leading-[1.15] font-semibold tracking-[-0.03em]">
            One account for orders, addresses and your wishlist.
          </h2>
          <p className="max-w-[420px] text-[15px] leading-[1.6] text-night-copy">
            It takes under a minute. We only email you about your orders unless you opt in to deals.
          </p>
        </>
      }
    >
      <title>Create account — Nexa Gadgets</title>
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-[calc(100svh-80px)] flex-col gap-[18px] md:min-h-0 md:gap-5"
      >
        <AuthHeading
          title="Create your account"
          subtitle={
            <>
              <span className="md:hidden">Track orders, save addresses, keep a wishlist.</span>
              <span className="hidden md:inline">
                Already have one?{" "}
                <Link to={paths.signIn({ redirect })} className="font-medium no-underline">
                  Sign in
                </Link>
              </span>
            </>
          }
        />

        <Field
          id="userName"
          label="Username"
          error={errors.userName?.message}
          hint="Shown next to your product reviews"
        >
          <Input
            {...form.register("userName")}
            {...fieldAria("userName", errors.userName?.message, true)}
            autoComplete="username"
          />
        </Field>

        <Field id="email" label="Email" error={errors.email?.message}>
          <Input
            {...form.register("email")}
            {...fieldAria("email", errors.email?.message)}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
        </Field>

        <Field id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            {...form.register("password")}
            {...fieldAria("password", errors.password?.message)}
            autoComplete="new-password"
            invalid={!!errors.password}
          />
          <PasswordStrength password={password} />
        </Field>

        <Controller
          control={form.control}
          name="marketingOptIn"
          render={({ field }) => (
            <label
              htmlFor="marketing"
              className="flex cursor-pointer items-start gap-3 text-sm leading-normal text-ink-2"
            >
              <Checkbox
                id="marketing"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
                className="mt-0.5"
              />
              Email me about new arrivals and deals (optional)
            </label>
          )}
        />

        {formError && (
          <p
            role="alert"
            className="rounded-md bg-warning-soft px-3.5 py-3 text-sm font-medium text-warning"
          >
            {formError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-1 md:mt-0"
          disabled={isLoading || cooldown.coolingDown}
        >
          {isLoading
            ? "Creating account…"
            : cooldown.coolingDown
              ? `Try again in ${cooldown.remaining}s`
              : "Create account"}
        </Button>

        <p className="text-center text-xs leading-normal text-muted-foreground md:text-[13px]">
          By creating an account you agree to our <Link to={paths.terms}>Terms</Link> and{" "}
          <Link to={paths.privacy}>Privacy Policy</Link>.
        </p>

        <p className="mt-auto text-center text-[15px] text-ink-2 md:hidden">
          Already have an account?{" "}
          <Link to={paths.signIn({ redirect })} className="font-medium no-underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
