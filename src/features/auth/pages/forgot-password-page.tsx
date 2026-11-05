import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { paths } from "@/app/paths";
import heroLaptop from "@/assets/hero-laptop.png";
import { Field } from "@/components/form/field";
import { fieldAria } from "@/components/form/field-aria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorStatus, getErrorMessage, isRateLimited } from "@/lib/api/errors";
import { useForgotPasswordMutation } from "../auth-api";
import { AuthHeading, AuthShell } from "../components/auth-shell";
import { useCooldown } from "../use-cooldown";

const schema = z.object({ email: z.email("Enter a full email address, like name@example.com") });

export default function ForgotPasswordPage() {
  const [forgot, { isLoading }] = useForgotPasswordMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const cooldown = useCooldown(60);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  const error = form.formState.errors.email?.message;

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      await forgot(email).unwrap();
      setSentTo(email);
    } catch (err) {
      if (isRateLimited(err)) cooldown.start();
      form.setError("email", {
        message:
          errorStatus(err) === 404
            ? "We couldn't find an account with that email"
            : getErrorMessage(err),
      });
    }
  });

  return (
    <AuthShell
      image={heroLaptop}
      imageAlt="Laptop"
      panel={
        <h2 className="max-w-[420px] text-[28px] leading-[1.15] font-semibold tracking-[-0.03em]">
          It happens. Let's get you back in.
        </h2>
      }
    >
      <title>Reset your password — Nexa Gadgets</title>
      {sentTo ? (
        <div className="flex flex-col gap-5">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MailCheck size={26} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <AuthHeading
            title="Check your inbox"
            subtitle={
              <>
                We've sent a reset link to{" "}
                <span className="font-medium text-foreground">{sentTo}</span>. Follow it to choose a
                new password.
              </>
            }
          />
          <Button asChild variant="outline" size="lg">
            <Link to={paths.signIn()}>Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <AuthHeading
            title="Forgot your password?"
            subtitle="Enter your email and we'll send you a link to reset it."
          />
          <Field id="email" label="Email" error={error}>
            <Input
              {...form.register("email")}
              {...fieldAria("email", error)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>
          <Button type="submit" size="lg" disabled={isLoading || cooldown.coolingDown}>
            {isLoading
              ? "Sending…"
              : cooldown.coolingDown
                ? `Try again in ${cooldown.remaining}s`
                : "Send reset link"}
          </Button>
          <p className="text-center text-[15px] text-ink-2">
            Remembered it?{" "}
            <Link to={paths.signIn()} className="font-medium no-underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
