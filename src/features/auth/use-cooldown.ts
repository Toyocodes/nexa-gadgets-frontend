import { useCallback, useEffect, useState } from "react";

/**
 * Auth endpoints answer 429 when rate-limited. After one, keep the submit
 * button disabled for a short while instead of letting people hammer it.
 */
export function useCooldown(seconds = 30) {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);

  const start = useCallback(() => {
    setUntil(Date.now() + seconds * 1000);
    setNow(Date.now());
  }, [seconds]);

  const remaining = Math.max(0, Math.ceil((until - now) / 1000));
  return { coolingDown: remaining > 0, remaining, start };
}
