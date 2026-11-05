import { Link } from "react-router";
import { paths } from "@/app/paths";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export function ContentPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-[880px] pt-6 pb-10 md:pt-10">
      <title>{`${title} — Nexa Gadgets`}</title>
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted-foreground">
        <Link to={paths.home} className="text-muted-foreground no-underline hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.04em] md:text-[40px]">{title}</h1>
      {intro && (
        <p className="mt-2 max-w-[620px] text-base leading-normal text-ink-2 md:text-lg">{intro}</p>
      )}
      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </div>
  );
}

export function StillStuck() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-border bg-card p-6 md:p-10">
      <div className="max-w-[520px]">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] md:text-[28px]">
          Still stuck?
        </h2>
        <p className="mt-2 text-[15px] leading-normal text-ink-2 md:text-base">
          Message us with your order number and we'll help.
          {site.supportEmail && (
            <>
              {" "}
              Or email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> — we reply to
              every email.
            </>
          )}
        </p>
      </div>
      <Button asChild variant="ink" size="lg">
        <a href={site.whatsappUrl} target="_blank" rel="noreferrer">
          Chat on WhatsApp
        </a>
      </Button>
    </div>
  );
}
