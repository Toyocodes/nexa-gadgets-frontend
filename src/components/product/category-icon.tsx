import {
  BatteryCharging,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
  type LucideProps,
} from "lucide-react";
import { categoryKind, type CategoryKind } from "@/config/catalog";

/** The earbuds glyph from the redesign (two stems), drawn like a Lucide icon. */
function EarbudsIcon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 3a3.5 3.5 0 0 0-3.5 3.5v1A3.5 3.5 0 0 0 7 11v8a1.5 1.5 0 0 0 3 0V6.5A3.5 3.5 0 0 0 7 3Z" />
      <path d="M17 3a3.5 3.5 0 0 1 3.5 3.5v1A3.5 3.5 0 0 1 17 11v8a1.5 1.5 0 0 1-3 0V6.5A3.5 3.5 0 0 1 17 3Z" />
    </svg>
  );
}

const ICONS: Record<CategoryKind, React.ComponentType<LucideProps>> = {
  phone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  earbuds: EarbudsIcon,
  watch: Watch,
  power: BatteryCharging,
};

export function CategoryIcon({
  category,
  kind,
  ...props
}: LucideProps & { category?: string; kind?: CategoryKind }) {
  const Icon = ICONS[kind ?? categoryKind(category ?? "")];
  return <Icon aria-hidden="true" {...props} />;
}
