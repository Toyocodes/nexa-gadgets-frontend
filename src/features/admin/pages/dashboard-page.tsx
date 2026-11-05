import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { paths } from "@/app/paths";
import { PageSpinner } from "@/components/feedback/page-spinner";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";
import { useGetAdminOrdersQuery, useGetAnalyticsQuery } from "../admin-api";
import { AdminHeading } from "../components/admin-layout";

const RANGES = [7, 14, 30] as const;
type Range = (typeof RANGES)[number];

interface Day {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

/**
 * Revenue counts paid orders only. (The analytics endpoint's total includes
 * unpaid checkouts, which would overstate it.)
 */
function dailySeries(orders: Order[], days: Range): Day[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const series: Day[] = [];
  const index = new Map<string, Day>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const day = {
      key,
      label: d.toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      revenue: 0,
      orders: 0,
    };
    series.push(day);
    index.set(key, day);
  }
  for (const o of orders) {
    if (o.paymentStatus !== "paid") continue;
    const d = new Date(o.orderDate);
    d.setHours(0, 0, 0, 0);
    const day = index.get(d.toISOString().slice(0, 10));
    if (day) {
      day.revenue += o.totalAmount;
      day.orders += 1;
    }
  }
  return series;
}

const compact = new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 });

export default function DashboardPage() {
  const analytics = useGetAnalyticsQuery();
  const orders = useGetAdminOrdersQuery();
  const [range, setRange] = useState<Range>(14);

  const all = useMemo(() => orders.data ?? [], [orders.data]);
  const paid = all.filter((o) => o.paymentStatus === "paid");
  const unpaid = all.filter((o) => o.paymentStatus !== "paid" && o.orderStatus !== "rejected");
  const toFulfil = paid.filter((o) => !["delivered", "rejected"].includes(o.orderStatus));
  const revenue = paid.reduce((sum, o) => sum + o.totalAmount, 0);
  const series = useMemo(() => dailySeries(all, range), [all, range]);

  if (analytics.isLoading || orders.isLoading) return <PageSpinner />;

  return (
    <>
      <AdminHeading
        title="Dashboard"
        description="Paid orders and revenue. Unpaid checkouts are counted separately."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Revenue (paid)" value={formatNaira(revenue)} />
        <Stat label="Paid orders" value={paid.length.toLocaleString()} />
        <Stat label="To fulfil" value={toFulfil.length.toLocaleString()} href={paths.adminOrders} />
        <Stat
          label="Awaiting payment"
          value={unpaid.length.toLocaleString()}
          href={`${paths.adminOrders}?view=unpaid`}
        />
        <Stat
          label="Customers"
          value={(analytics.data?.analyticsData.users ?? 0).toLocaleString()}
        />
        <Stat
          label="Products"
          value={(analytics.data?.analyticsData.products ?? 0).toLocaleString()}
          href={paths.adminProducts}
        />
      </div>

      {/* Filters sit in one row above the charts they scope. */}
      <div role="group" aria-label="Date range" className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className={cn(
              "h-9 rounded-full border px-3.5 text-[13px] transition-colors",
              range === r
                ? "border-foreground bg-foreground text-white"
                : "border-input bg-card hover:border-foreground",
            )}
          >
            Last {r} days
          </button>
        ))}
      </div>

      {/* Two measures with different scales → two charts, never a dual axis. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Revenue"
          subtitle={`Paid orders, last ${range} days`}
          total={formatNaira(series.reduce((s, d) => s + d.revenue, 0))}
        >
          <DailyBars
            data={series}
            dataKey="revenue"
            format={formatNaira}
            tickFormat={(v) => (v >= 10_000 ? `₦${compact.format(v)}` : `₦${v}`)}
          />
        </ChartCard>
        <ChartCard
          title="Orders"
          subtitle={`Paid orders per day, last ${range} days`}
          total={String(series.reduce((s, d) => s + d.orders, 0))}
        >
          <DailyBars
            data={series}
            dataKey="orders"
            format={(v) => `${v} ${v === 1 ? "order" : "orders"}`}
            tickFormat={(v) => String(v)}
            allowDecimals={false}
          />
        </ChartCard>
      </div>

      <details className="rounded-2xl border border-border bg-card px-5 py-3">
        <summary className="cursor-pointer py-1 text-sm font-medium">View as table</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 font-medium">Day</th>
                <th className="py-2 text-right font-medium">Paid orders</th>
                <th className="py-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {series.map((d) => (
                <tr key={d.key} className="border-b border-border last:border-0">
                  <td className="py-2">{d.label}</td>
                  <td className="py-2 text-right font-mono">{d.orders}</td>
                  <td className="py-2 text-right font-mono">{formatNaira(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="font-mono text-2xl font-semibold tracking-[-0.02em] md:text-[28px]">
        {value}
      </span>
    </>
  );
  const cls =
    "flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-5 text-foreground no-underline";
  return href ? (
    <Link
      to={href}
      className={cn(cls, "transition-colors hover:border-input hover:text-foreground")}
    >
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function ChartCard({
  title,
  subtitle,
  total,
  children,
}: {
  title: string;
  subtitle: string;
  total: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-[13px] text-muted-foreground">{subtitle}</p>
        </div>
        <span className="font-mono text-lg font-semibold">{total}</span>
      </div>
      <div className="h-[220px]">{children}</div>
    </section>
  );
}

function DailyBars({
  data,
  dataKey,
  format,
  tickFormat,
  allowDecimals,
}: {
  data: Day[];
  dataKey: "revenue" | "orders";
  format: (v: number) => string;
  tickFormat: (v: number) => string;
  allowDecimals?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap={2}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis
          width={52}
          tickLine={false}
          axisLine={false}
          allowDecimals={allowDecimals}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontFamily: "var(--font-mono)" }}
          tickFormatter={tickFormat}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={(props: TooltipContentProps<ValueType, NameType>) => (
            <ChartTooltip {...props} format={format} />
          )}
        />
        <Bar
          dataKey={dataKey}
          fill="var(--primary)"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          activeBar={{ fill: "var(--primary-hover)" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Value first (strong), label second — the tooltip's job is the number. */
function ChartTooltip({
  active,
  payload,
  label,
  format,
}: TooltipContentProps<ValueType, NameType> & { format: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
      <div className="font-mono text-sm font-semibold">{format(value)}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
