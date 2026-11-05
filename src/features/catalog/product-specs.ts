import type { ProductSpec } from "@/types/api";

// Labels whose value already says it all ("5G", "iOS 17").
const VALUE_ONLY = /^(network|connectivity|operating system|os|colou?r|model|chip|processor)$/i;
// Labels written in capitals when appended ("6GB RAM").
const KEEP_CASE = /^(RAM|ROM|SSD|HDD|GPU|CPU|USB|NFC)$/;

/** "Memory (RAM)" → "RAM", "Display" → "display". */
function shortLabel(label: string) {
  const inParens = label.match(/\(([^)]+)\)/)?.[1];
  const base = (inParens ?? label).trim();
  return KEEP_CASE.test(base) ? base : base.toLowerCase();
}

/**
 * Turn the first spec rows into chips like the redesign: "6.7″ display",
 * "256GB storage", "6GB RAM", "5G". The label is added only when it adds meaning.
 */
export function specChips(specs: ProductSpec[] | undefined, max = 4) {
  return (specs ?? []).slice(0, max).map(({ label, value }) => {
    if (VALUE_ONLY.test(label.trim()) || !/^\d/.test(value.trim())) return value;
    return `${value} ${shortLabel(label)}`;
  });
}
