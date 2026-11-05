import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { Field } from "@/components/form/field";
import { fieldAria } from "@/components/form/field-aria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/features/auth/auth-api";
import { PasswordInput, PasswordStrength } from "@/features/auth/components/password-input";
import { fieldForMessage } from "@/features/auth/server-errors";
import { useCooldown } from "@/features/auth/use-cooldown";
import { getErrorMessage, isRateLimited } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import type { Profile } from "@/types/api";

export default function DetailsPage() {
  const { data: profile, isLoading } = useGetProfileQuery();
  return (
    <>
      <title>Account details — Nexa Gadgets</title>
      <h1 className="mb-1 text-[28px] font-semibold tracking-[-0.04em] md:text-4xl">
        Account details
      </h1>
      {isLoading || !profile ? (
        <PageSpinner className="min-h-[30vh]" />
      ) : (
        <>
          <ProfileForm profile={profile} />
          <PasswordForm />
          <p className="text-[13px] text-muted-foreground">
            Member since {formatDate(profile.createdAt)}
          </p>
        </>
      )}
    </>
  );
}

const profileSchema = z.object({
  userName: z.string().trim().min(1, "Username cannot be empty"),
  email: z.email("Enter a valid email address"),
  currentPassword: z.string().optional(),
  marketingOptIn: z.boolean(),
});
type ProfileValues = z.infer<typeof profileSchema>;

function ProfileForm({ profile }: { profile: Profile }) {
  const [update, { isLoading }] = useUpdateProfileMutation();
  const defaults = {
    userName: profile.userName,
    email: profile.email,
    currentPassword: "",
    marketingOptIn: profile.marketingOptIn,
  };
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
  });
  const { errors, isDirty } = form.formState;
  const email = useWatch({ control: form.control, name: "email" });
  const emailChanged = email.trim().toLowerCase() !== profile.email.toLowerCase();

  useEffect(() => form.reset(defaults), [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit(async (v) => {
    // Send only what changed; changing email needs the current password.
    const body: Partial<ProfileValues> = {};
    if (v.userName !== profile.userName) body.userName = v.userName;
    if (emailChanged) {
      if (!v.currentPassword)
        return form.setError("currentPassword", {
          message: "Enter your current password to change your email",
        });
      body.email = v.email;
      body.currentPassword = v.currentPassword;
    }
    if (v.marketingOptIn !== profile.marketingOptIn) body.marketingOptIn = v.marketingOptIn;
    if (!Object.keys(body).length) return;
    try {
      const res = await update(body).unwrap();
      toast.success(res.message || "Account updated");
    } catch (err) {
      const message = getErrorMessage(err);
      const field = fieldForMessage(message, ["userName", "email", "currentPassword"] as const);
      if (field) form.setError(field, { message });
      else toast.error(message);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <h2 className="text-base font-semibold">Profile</h2>
      <div className="grid gap-5 md:grid-cols-2">
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
            autoComplete="email"
          />
        </Field>
      </div>
      {emailChanged && (
        <Field
          id="currentPassword"
          label="Current password"
          error={errors.currentPassword?.message}
          hint="Needed to change your email"
        >
          <PasswordInput
            {...form.register("currentPassword")}
            {...fieldAria("currentPassword", errors.currentPassword?.message, true)}
            autoComplete="current-password"
            invalid={!!errors.currentPassword}
          />
        </Field>
      )}
      <Controller
        control={form.control}
        name="marketingOptIn"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted px-4 py-3.5">
            <label htmlFor="marketing" className="text-[15px]">
              Email me about new arrivals and deals
            </label>
            <Switch id="marketing" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
      <Button type="submit" size="md" className="self-start" disabled={!isDirty || isLoading}>
        {isLoading ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Use at least 8 characters"),
});
type PasswordValues = z.infer<typeof passwordSchema>;

function PasswordForm() {
  const [change, { isLoading }] = useChangePasswordMutation();
  const cooldown = useCooldown();
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });
  const { errors } = form.formState;
  const newPassword = useWatch({ control: form.control, name: "newPassword" });

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await change(v).unwrap();
      toast.success("Password changed");
      form.reset();
    } catch (err) {
      if (isRateLimited(err)) cooldown.start();
      const message = getErrorMessage(err);
      form.setError(
        fieldForMessage(message, ["currentPassword", "newPassword"] as const) ?? "currentPassword",
        { message },
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 md:p-6"
    >
      <h2 className="text-base font-semibold">Change password</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="cp-current" label="Current password" error={errors.currentPassword?.message}>
          <PasswordInput
            {...form.register("currentPassword")}
            {...fieldAria("cp-current", errors.currentPassword?.message)}
            autoComplete="current-password"
            invalid={!!errors.currentPassword}
          />
        </Field>
        <Field id="cp-new" label="New password" error={errors.newPassword?.message}>
          <PasswordInput
            {...form.register("newPassword")}
            {...fieldAria("cp-new", errors.newPassword?.message)}
            autoComplete="new-password"
            invalid={!!errors.newPassword}
          />
          <PasswordStrength password={newPassword} />
        </Field>
      </div>
      <Button
        type="submit"
        variant="ink"
        size="md"
        className="self-start"
        disabled={isLoading || cooldown.coolingDown}
      >
        {isLoading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
