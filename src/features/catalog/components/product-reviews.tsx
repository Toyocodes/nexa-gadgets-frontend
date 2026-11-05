import { useState } from "react";
import { useAppSelector } from "@/app/store";
import { StarRow } from "@/components/product/rating";
import { Button } from "@/components/ui/button";
import { selectUser } from "@/features/auth/auth-slice";
import { useSignInRedirect } from "@/features/auth/use-sign-in-redirect";
import { formatDate, pluralize } from "@/lib/format";
import type { Product, Review } from "@/types/api";
import { useGetReviewsQuery } from "../catalog-api";
import { ReviewDialog } from "./review-dialog";

export function ProductReviews({ product }: { product: Product }) {
  const { data: reviews = [] } = useGetReviewsQuery(product._id);
  const user = useAppSelector(selectUser);
  const signIn = useSignInRedirect();
  const [open, setOpen] = useState(false);

  const count = Math.max(product.numReviews ?? 0, reviews.length);
  const average =
    product.averageReview ||
    (reviews.length ? reviews.reduce((s, r) => s + r.reviewValue, 0) / reviews.length : 0);
  const alreadyReviewed = !!user && reviews.some((r) => r.userId === user.id);
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => Math.round(r.reviewValue) === star).length;
    return { star, n, pct: reviews.length ? (n / reviews.length) * 100 : 0 };
  });

  return (
    <section
      id="reviews"
      className="mt-8 flex scroll-mt-24 flex-wrap gap-x-12 gap-y-3 px-4 md:mt-16 md:gap-y-6 md:px-0"
    >
      <div className="flex flex-[1_1_240px] flex-col gap-4">
        <div className="flex items-baseline justify-between md:block">
          <h2 className="text-xl font-semibold tracking-[-0.03em] md:text-[28px]">Reviews</h2>
          {count > 0 && (
            <span className="text-sm text-muted-foreground md:hidden">
              {average.toFixed(1)} · {pluralize(count, "review")}
            </span>
          )}
        </div>
        {count > 0 && (
          <div className="hidden flex-col gap-4 md:flex">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[44px] font-semibold">{average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                from {pluralize(count, "review")}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {dist.map((d) => (
                <div key={d.star} className="flex items-center gap-2.5 text-[13px] text-ink-2">
                  <span className="w-3 font-mono">{d.star}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-border">
                    <div
                      className="h-1.5 rounded-full bg-foreground"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="w-4 text-right font-mono">{d.n}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="order-last m-0 text-[13px] leading-normal text-muted-foreground md:order-none md:mt-2 md:text-sm">
          Only customers who bought this item can review it.
        </p>
        {!alreadyReviewed && (
          <Button
            variant="outline"
            size="md"
            className="hidden self-start text-[15px] md:inline-flex"
            onClick={() => (user ? setOpen(true) : signIn())}
          >
            Write a review
          </Button>
        )}
      </div>

      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-3">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-[15px] text-muted-foreground">
            No reviews yet. Bought this? You'll be able to review it from your orders.
          </div>
        ) : (
          reviews.map((r) => <ReviewCard key={r._id} review={r} />)
        )}
      </div>

      <ReviewDialog
        productId={product._id}
        productTitle={product.title}
        open={open}
        onOpenChange={setOpen}
      />
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.reviewMessage.length > 240;
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 md:gap-3 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
          <span className="hidden size-10 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary uppercase md:flex">
            {review.userName.charAt(0)}
          </span>
          <div className="flex w-full items-baseline justify-between md:block">
            <div className="text-sm font-semibold md:text-[15px]">{review.userName}</div>
            <div className="text-[13px] font-medium text-success">Verified buyer</div>
          </div>
        </div>
        <span className="hidden text-[13px] text-muted-foreground md:block">
          {formatDate(review.createdAt)}
        </span>
      </div>
      <StarRow value={review.reviewValue} size={16} className="hidden md:flex" />
      {review.reviewMessage && (
        <p
          className={`m-0 text-sm leading-[1.55] text-ink-2 md:text-[15px] md:leading-[1.6] ${long && !expanded ? "line-clamp-3" : ""}`}
        >
          {review.reviewMessage}
        </p>
      )}
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-sm text-primary"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </article>
  );
}
