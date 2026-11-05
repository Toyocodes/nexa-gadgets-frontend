import { cn } from "@/lib/utils";

const STAR =
  "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

export function StarGlyph({
  size,
  filled,
  className,
}: {
  size: number;
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(filled ? "fill-foreground" : "fill-input", className)}
    >
      <polygon points={STAR} />
    </svg>
  );
}

/** Five stars, filled to the nearest whole star. */
export function StarRow({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      role="img"
      aria-label={`Rated ${rounded} out of 5`}
      className={cn("flex gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <StarGlyph key={n} size={size} filled={n <= rounded} />
      ))}
    </span>
  );
}

/**
 * "★ 4.0" for product cards. Renders nothing for unreviewed products — the
 * redesign never shows "0.0".
 */
export function CardRating({ average, count }: { average?: number; count?: number }) {
  if (!count || !average) return null;
  return (
    <span className="flex items-center gap-1 text-[13px] text-ink-2">
      <StarGlyph size={13} filled />
      <span className="sr-only">Rated</span>
      {average.toFixed(1)}
    </span>
  );
}
