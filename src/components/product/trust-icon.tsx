import { Lock, RotateCcw, ShieldCheck, Truck, type LucideProps } from "lucide-react";

const ICONS = { delivery: Truck, warranty: ShieldCheck, returns: RotateCcw, payment: Lock };

export type TrustKey = keyof typeof ICONS;

export function TrustIcon({ name, ...props }: LucideProps & { name: TrustKey }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" {...props} />;
}
