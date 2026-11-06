import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Mail, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";
import { paths } from "@/app/paths";
import heroLaptop from "@/assets/hero-laptop.png";
import { Field } from "@/components/form/field";
import { fieldAria } from "@/components/form/field-aria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage, isRateLimited, serverErrorField } from "@/lib/api/errors";
import { useLoginMutation, useRequestMagicLinkMutation } from "../auth-api";
import { AuthHeading, AuthShell } from "../components/auth-shell";
import { PasswordInput } from "../components/password-input";
import { useCooldown } from "../use-cooldown";

const schema = z.object({
  email: z.email("Enter a full email address, like name@example.com"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export default function SignInPage() {
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? undefined;
  const [login, { isLoading }] = useLoginMutation();
  const [requestLink, { isLoading: sendingLink }] = useRequestMagicLinkMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const cooldown = useCooldown();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await login(values).unwrap();
      // Wrong email/password come back as 200 { success: false }.
      if (!res.success) {
        const field = serverErrorField(res, ["email", "password"] as const);
        if (field) form.setError(field, { message: res.message });
        else setFormError(res.message);
      }
      // On success the GuestOnly guard redirects (admins → dashboard).
    } catch (err) {
      if (isRateLimited(err)) cooldown.start();
      setFormError(getErrorMessage(err));
    }
  });

  const sendLink = async () => {
    setFormError(null);
    const ok = await form.trigger("email");
    if (!ok) return;
    const email = form.getValues("email");
    try {
      await requestLink(email).unwrap();
      setLinkSentTo(email);
    } catch (err) {
      if (isRateLimited(err)) cooldown.start();
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell
      image={heroLaptop}
      imageAlt="Laptop"
      panel={
        <>
          <h2 className="max-w-[420px] text-[28px] leading-[1.15] font-semibold tracking-[-0.03em]">
            Your account keeps checkout quick.
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px] text-ink-2">
            {[
              "Track every order from payment to delivery",
              "Save addresses for one-tap checkout",
              "Keep a wishlist and review what you buy",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <Check size={18} strokeWidth={2} className="text-primary" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <title>Sign in — Nexa Gadgets</title>
      {linkSentTo ? (
        <div className="flex flex-col gap-5">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MailCheck size={26} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <AuthHeading
            title="Check your inbox"
            subtitle={
              <>
                If an account exists for{" "}
                <span className="font-medium text-foreground">{linkSentTo}</span>, a sign-in link is
                on its way. It works once and expires in 10 minutes.
              </>
            }
          />
          <Button variant="outline" size="lg" onClick={() => setLinkSentTo(null)}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <AuthHeading
            title="Welcome back"
            subtitle="Sign in to track orders and check out faster."
          />

          <Field id="email" label="Email" error={errors.email?.message}>
            <Input
              {...form.register("email")}
              {...fieldAria("email", errors.email?.message)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>

          <Field
            id="password"
            label="Password"
            error={errors.password?.message}
            aside={
              <Link to={paths.forgotPassword} className="text-sm">
                Forgot password?
              </Link>
            }
          >
            <PasswordInput
              {...form.register("password")}
              {...fieldAria("password", errors.password?.message)}
              autoComplete="current-password"
              invalid={!!errors.password}
            />
          </Field>

          {formError && (
            <p
              role="alert"
              className="rounded-md bg-warning-soft px-3.5 py-3 text-sm font-medium text-warning"
            >
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isLoading || cooldown.coolingDown}>
            {isLoading
              ? "Signing in…"
              : cooldown.coolingDown
                ? `Try again in ${cooldown.remaining}s`
                : "Sign in"}
          </Button>

          <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={sendLink}
            disabled={sendingLink || cooldown.coolingDown}
          >
            <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
            {sendingLink ? "Sending…" : "Email me a sign-in link"}
          </Button>

          <p className="mt-2 text-center text-[15px] text-ink-2">
            New to Nexa?{" "}
            <Link to={paths.signUp({ redirect })} className="font-medium no-underline">
              Create an account
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
