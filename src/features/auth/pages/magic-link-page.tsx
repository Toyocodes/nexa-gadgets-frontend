import { useEffect, useRef, useState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { paths } from "@/app/paths";
import heroLaptop from "@/assets/hero-laptop.png";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";
import { useVerifyMagicLinkMutation } from "../auth-api";
import { AuthHeading, AuthShell } from "../components/auth-shell";

/** Landing page for "Email me a sign-in link". The token works once, for 10 minutes. */
export default function MagicLinkPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [verify] = useVerifyMagicLinkMutation();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // Guard against StrictMode's double effect: the token is single-use.
    if (started.current) return;
    started.current = true;
    verify(token)
      .unwrap()
      .then((res) => {
        if (res.success && res.user)
          navigate(res.user.role === "admin" ? paths.admin : paths.home, { replace: true });
        else setError(res.message);
      })
      .catch((err) =>
        setError(getErrorMessage(err, "This sign-in link is invalid or has expired")),
      );
  }, [token, verify, navigate]);

  return (
    <AuthShell
      image={heroLaptop}
      imageAlt="Laptop"
      panel={
        <h2 className="max-w-[420px] text-[28px] leading-[1.15] font-semibold tracking-[-0.03em]">
          Your account keeps checkout quick.
        </h2>
      }
    >
      <title>Signing you in — Nexa Gadgets</title>
      {error ? (
        <div className="flex flex-col gap-5">
          <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
            <CircleAlert size={26} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <AuthHeading title="That link didn't work" subtitle={error} />
          <Button asChild size="lg">
            <Link to={paths.signIn()}>Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <div role="status" className="flex flex-col items-start gap-5">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
          <AuthHeading title="Signing you in…" subtitle="One moment while we check your link." />
        </div>
      )}
    </AuthShell>
  );
}
