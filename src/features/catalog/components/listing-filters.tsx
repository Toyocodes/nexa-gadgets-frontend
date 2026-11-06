import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { BRANDS, CATEGORIES, PRICE_PRESETS } from "@/config/catalog";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ListingFilters } from "../use-listing-filters";

interface FiltersPanelProps {
  filters: ListingFilters;
  update: (patch: Partial<ListingFilters>) => void;
  clearAll: () => void;
}

const legend =
  "mb-3 w-full p-0 text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase";

export function FiltersPanel({ filters, update, clearAll }: FiltersPanelProps) {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const visibleBrands = showAllBrands ? BRANDS : BRANDS.slice(0, 5);
  const toggleIn = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold">Filters</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-primary hover:text-primary-hover"
        >
          Clear all
        </button>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={legend}>Availability</legend>
        <SwitchRow
          label="In stock only"
          checked={filters.inStock}
          onChange={(v) => update({ inStock: v })}
        />
        <SwitchRow
          label="On sale"
          checked={filters.onSale}
          onChange={(v) => update({ onSale: v })}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-border pt-6">
        <legend className={cn(legend, "float-left")}>Price</legend>
        <div className="flex items-center gap-2">
          <PriceInput
            label="Min"
            value={filters.minPrice}
            onCommit={(v) => update({ minPrice: v })}
          />
          <PriceInput
            label="Max"
            value={filters.maxPrice}
            onCommit={(v) => update({ maxPrice: v })}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => {
            const active = (filters.minPrice ?? undefined) === p.min && filters.maxPrice === p.max;
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  update(
                    active
                      ? { minPrice: undefined, maxPrice: undefined }
                      : { minPrice: p.min, maxPrice: p.max },
                  )
                }
                className={cn(
                  "h-9 rounded-full border px-3 text-[13px] transition-colors",
                  active
                    ? "border-foreground bg-foreground text-ink-foreground"
                    : "border-input bg-card text-foreground hover:border-foreground",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1 border-t border-border pt-6">
        <legend className={cn(legend, "float-left mb-2")}>Category</legend>
        {CATEGORIES.map((c) => (
          <CheckRow
            key={c.id}
            label={c.label}
            checked={filters.category.includes(c.id)}
            onChange={() => update({ category: toggleIn(filters.category, c.id) })}
          />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-1 border-t border-border pt-6">
        <legend className={cn(legend, "float-left mb-2")}>Brand</legend>
        {visibleBrands.map((b) => (
          <CheckRow
            key={b.id}
            label={b.label}
            checked={filters.brand.includes(b.id)}
            onChange={() => update({ brand: toggleIn(filters.brand, b.id) })}
          />
        ))}
        {BRANDS.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllBrands((v) => !v)}
            className="mt-1 self-start text-sm text-primary hover:text-primary-hover"
          >
            {showAllBrands ? "Show fewer" : `Show ${BRANDS.length - 5} more`}
          </button>
        )}
      </fieldset>
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between text-[15px]">
      <label htmlFor={id}>{label}</label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-h-9 cursor-pointer items-center gap-3 text-[15px]">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}

/** Shows "₦20,000" at rest and plain digits while editing; commits on blur/Enter. */
function PriceInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value?: number;
  onCommit: (v?: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value != null ? formatNaira(value) : "");
  const commit = () => {
    if (draft == null) return;
    const digits = draft.replace(/[^\d]/g, "");
    onCommit(digits ? Number(digits) : undefined);
    setDraft(null);
  };
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <input
        type="text"
        inputMode="numeric"
        placeholder={label === "Min" ? "₦0" : "Any"}
        value={shown}
        onFocus={() => setDraft(value != null ? String(value) : "")}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="h-10 w-full min-w-0 rounded-sm border border-input bg-card px-2.5 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15"
      />
    </label>
  );
}
