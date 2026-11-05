import { effectivePrice, formatNaira, isDiscounted } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  salePrice?: number;
  className?: string;
  wasClassName?: string;
}

/** Sale price in Geist Mono with the struck-through original beside it. */
export function Price({ price, salePrice = 0, className, wasClassName }: PriceProps) {
  const onSale = isDiscounted({ price, salePrice });
  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
      <span className={cn("font-mono text-[17px] font-semibold", className)}>
        {formatNaira(effectivePrice({ price, salePrice }))}
      </span>
      {onSale && (
        <s className={cn("text-sm text-muted-foreground", wasClassName)}>
          <span className="sr-only">was </span>
          {formatNaira(price)}
        </s>
      )}
    </span>
  );
}
