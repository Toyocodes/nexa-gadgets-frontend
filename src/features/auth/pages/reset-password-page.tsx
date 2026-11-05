import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { paths } from "@/app/paths";
import heroLaptop from "@/assets/hero-laptop.png";
import { Field } from "@/components/form/field";
import { fieldAria } from "@/components/form/field-aria";
import { Button } from "@/components/ui/button";
import { getErrorMessage, isRateLimited } from "@/lib/api/errors";
import { useResetPasswordMutation } from "../auth-api";
import { AuthHeading, AuthShell } from "../components/auth-shell";
import { PasswordInput, PasswordStrength } from "../components/password-input";
import { useCooldown } from "../use-cooldown";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [reset, { isLoading }] = useResetPasswordMutation();
  const cooldown = useCooldown();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });
  const { errors } = form.formState;
  const password = useWatch({ control: form.control, name: "password" });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    try {
      await reset({ token, password }).unwrap();
      toast.success("Password updated. Sign in with your new password.");
      navigate(paths.signIn(), { replace: true });
    } catch (err) {
      if (isRateLimited(err)) cooldown.start();
      form.setError("password", {
        message: getErrorMessage(err, "This reset link is invalid or has expired"),
      });
    }
  });

  return (
    <AuthShell
      image={heroLaptop}
      imageAlt="Laptop"
      panel={
        <h2 className="max-w-[420px] text-[28px] leading-[1.15] font-semibold tracking-[-0.03em]">
          Choose a new password.
        </h2>
      }
    >
      <title>Choose a new password — Nexa Gadgets</title>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <AuthHeading
          title="Choose a new password"
          subtitle="Use at least 8 characters. A number and a symbol make it stronger."
        />
        <Field id="password" label="New password" error={errors.password?.message}>
          <PasswordInput
            {...form.register("password")}
            {...fieldAria("password", errors.password?.message)}
            autoComplete="new-password"
            invalid={!!errors.password}
          />
          <PasswordStrength password={password} />
        </Field>
        <Field id="confirm" label="Confirm new password" error={errors.confirm?.message}>
          <PasswordInput
            {...form.register("confirm")}
            {...fieldAria("confirm", errors.confirm?.message)}
            autoComplete="new-password"
            invalid={!!errors.confirm}
          />
        </Field>
        <Button type="submit" size="lg" disabled={isLoading || cooldown.coolingDown}>
          {isLoading ? "Saving…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
