import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { paths } from "@/app/paths";
import heroCustomer from "@/assets/hero-customer.png";
import heroIphone from "@/assets/hero-iphone.png";
import heroLaptop from "@/assets/hero-laptop.png";
import { CategoryIcon } from "@/components/product/category-icon";
import { TrustIcon } from "@/components/product/trust-icon";
import { Button } from "@/components/ui/button";
import { AUDIO_CATEGORIES, BRANDS, CATEGORIES } from "@/config/catalog";
import { trustPoints } from "@/config/site";
import { useGetProductsQuery } from "../catalog-api";
import { ProductCard, ProductCardSkeleton, ProductGrid } from "../components/product-card";

export default function HomePage() {
  return (
    <>
      <title>Nexa Gadgets — Genuine gadgets. Fair prices.</title>
      <Hero />
      <TrustStrip />
      <Categories />
      <Trending />
      <Brands />
      <HelpBand />
    </>
  );
}

function Hero() {
  return (
    <section className="container-page flex flex-wrap gap-5 pt-4 md:pt-8">
      <div className="flex min-w-0 flex-[2_1_640px] flex-col overflow-hidden rounded-[20px] bg-tile md:min-h-[520px] md:flex-row md:flex-wrap md:items-stretch md:rounded-3xl">
        <div className="flex flex-col justify-center gap-3.5 px-6 pt-6 md:flex-[1_1_360px] md:gap-6 md:py-12 md:pt-14 md:pr-0 md:pl-14">
          <span className="self-start rounded-full bg-primary-soft px-2.5 py-[5px] text-xs font-medium text-primary md:px-3 md:py-1.5 md:text-[13px]">
            New arrivals every week
          </span>
          <h1 className="text-[38px] leading-none font-semibold tracking-[-0.045em] md:text-[64px] md:leading-[0.98]">
            Genuine gadgets.
            <br />
            Fair prices.
          </h1>
          <p className="max-w-[420px] text-[15px] leading-normal text-ink-2 md:text-lg">
            <span className="hidden md:inline">
              Phones, laptops and audio from Apple, Samsung, Oraimo, Tecno and more — with
              manufacturer warranty and 7-day returns.
            </span>
            <span className="md:hidden">With manufacturer warranty and 7-day returns.</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 px-5 text-[15px] md:h-13 md:px-6 md:text-base"
            >
              <Link to={paths.products({ category: "phones" })}>
                Shop phones
                <ArrowRight size={18} strokeWidth={2} className="hidden md:block" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hidden md:inline-flex">
              <Link to={paths.products()}>Browse everything</Link>
            </Button>
          </div>
        </div>
        <div className="-mt-2 flex justify-end md:mt-0 md:flex-[0_1_380px] md:items-end md:justify-center">
          <img
            src={heroCustomer}
            alt="Smiling customer holding a new smartphone"
            width={466}
            height={580}
            fetchPriority="high"
            className="block h-auto w-[260px] md:w-full md:max-w-[380px]"
          />
        </div>
      </div>

      <div className="hidden min-w-0 flex-[1_1_320px] flex-col gap-5 md:flex">
        <PromoCard
          to={paths.products({ category: AUDIO_CATEGORIES.join(",") })}
          eyebrow="Audio"
          title="Headphones & earbuds"
          cta="Shop audio →"
          image={heroIphone}
          dark
        />
        <PromoCard
          to={paths.products({ category: "laptop" })}
          eyebrow="Laptops"
          title="Work, study, create"
          cta="Shop laptops →"
          image={heroLaptop}
        />
      </div>
    </section>
  );
}

function PromoCard(props: {
  to: string;
  eyebrow: string;
  title: string;
  cta: string;
  image: string;
  dark?: boolean;
}) {
  return (
    <Link
      to={props.to}
      className={`flex min-h-[250px] flex-1 justify-between gap-3 overflow-hidden rounded-3xl p-7 no-underline ${
        props.dark
          ? "bg-night text-white hover:text-white"
          : "bg-primary-wash text-foreground hover:text-foreground"
      }`}
    >
      <div className="flex flex-col justify-between">
        <div>
          <div className={`text-[13px] ${props.dark ? "text-night-muted" : "text-ink-2"}`}>
            {props.eyebrow}
          </div>
          <div className="mt-1.5 text-[26px] leading-[1.1] font-semibold tracking-[-0.03em]">
            {props.title}
          </div>
        </div>
        <span className="text-sm font-medium">{props.cta}</span>
      </div>
      <img
        src={props.image}
        alt=""
        width={170}
        height={170}
        className="size-[170px] self-center object-contain"
      />
    </Link>
  );
}

function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="container-page pt-8 md:pt-5">
      {/* Desktop: one white strip */}
      <div className="hidden grid-cols-[repeat(auto-fit,minmax(220px,1fr))] rounded-2xl border border-border bg-card md:grid">
        {trustPoints.map((t) => (
          <div key={t.key} className="flex items-center gap-3.5 px-6 py-5">
            <TrustIcon name={t.key} size={24} strokeWidth={1.8} className="text-primary" />
            <div>
              <div className="text-[15px] font-semibold">{t.title}</div>
              <div className="text-[13px] text-muted-foreground">{t.detail}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile: 2×2 tiles */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {(
          [
            ["delivery", "Lagos delivery or store pickup"],
            ["warranty", "Manufacturer warranty"],
            ["returns", "7-day returns"],
            ["payment", "Pay by bank transfer"],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5"
          >
            <TrustIcon name={key} size={20} strokeWidth={1.8} className="text-primary" />
            <span className="text-sm leading-[1.3] font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 flex items-baseline justify-between gap-4 md:mb-5">
      <h2 className="text-[22px] font-semibold tracking-[-0.03em] md:text-[28px]">{children}</h2>
      {action}
    </div>
  );
}

function Categories() {
  return (
    <section className="container-page hidden pt-16 md:block">
      <SectionTitle>Shop by category</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            to={paths.products({ category: c.id })}
            className="flex flex-col gap-7 rounded-2xl border border-border bg-card p-5 text-foreground no-underline transition-colors hover:border-input hover:text-foreground"
          >
            <span className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <CategoryIcon kind={c.kind} size={24} strokeWidth={1.6} />
            </span>
            <span className="flex items-center justify-between text-base font-medium">
              {c.label}
              <ChevronRight
                size={16}
                strokeWidth={2}
                className="text-muted-foreground"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Trending() {
  // Highest-rated first, as the integration guide specifies for this rail.
  const { data, isLoading, isError } = useGetProductsQuery({ sortBy: "rating", page: 1, limit: 4 });
  if (isError) return null;
  return (
    <section className="container-page pt-8 md:pt-16">
      <SectionTitle
        action={
          <Link to={paths.products()} className="text-sm font-medium md:text-[15px]">
            <span className="hidden md:inline">View all products →</span>
            <span className="md:hidden">View all</span>
          </Link>
        }
      >
        Trending now
      </SectionTitle>
      <ProductGrid>
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
          : data?.data.map((p, i) => <ProductCard key={p._id} product={p} priority={i < 2} />)}
      </ProductGrid>
    </section>
  );
}

function Brands() {
  return (
    <section className="container-page pt-8 md:pt-16">
      <SectionTitle>Shop by brand</SectionTitle>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {BRANDS.map((b) => (
          <Link
            key={b.id}
            to={paths.products({ brand: b.id })}
            className="flex h-11 items-center rounded-full border border-border bg-card px-[18px] text-[15px] font-semibold text-foreground no-underline transition-colors hover:border-foreground hover:text-foreground md:h-14 md:px-7 md:text-[17px] md:tracking-[-0.02em]"
          >
            {b.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function HelpBand() {
  return (
    <section className="container-page hidden pt-16 md:block">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-card p-10">
        <div className="max-w-[560px]">
          <h2 className="text-[28px] font-semibold tracking-[-0.03em]">
            Not sure which one to get?
          </h2>
          <p className="mt-2 text-base leading-normal text-ink-2">
            Our FAQs cover delivery times, warranty claims, returns and how to pay. Still stuck? We
            reply to every email.
          </p>
        </div>
        <Button asChild variant="ink" size="lg">
          <Link to={paths.help}>Read the FAQs</Link>
        </Button>
      </div>
    </section>
  );
}
