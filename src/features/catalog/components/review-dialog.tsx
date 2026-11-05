import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useAddReviewMutation } from "../catalog-api";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
const STAR =
  "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

interface ReviewDialogProps {
  productId: string;
  productTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Only customers with a paid order for the product can review it — the API
 * enforces that and its message ("You need to purchase product to review
 * it.") is shown inline if not.
 */
export function ReviewDialog({ productId, productTitle, open, onOpenChange }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [addReview, { isLoading }] = useAddReviewMutation();
  const shown = hover || rating;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return setError("Choose a rating from 1 to 5 stars");
    setError(null);
    try {
      await addReview({ productId, reviewValue: rating, reviewMessage: message.trim() }).unwrap();
      toast.success("Thanks — your review is live");
      onOpenChange(false);
      setRating(0);
      setMessage("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-[480px]">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-[-0.02em]">Write a review</DialogTitle>
            <DialogDescription>{productTitle}</DialogDescription>
          </DialogHeader>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Your rating</legend>
            <div className="flex items-center gap-3">
              <div
                role="radiogroup"
                aria-label="Rating"
                className="flex gap-1"
                onMouseLeave={() => setHover(0)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    className="flex size-10 items-center justify-center rounded-md hover:bg-muted"
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className={cn(n <= shown ? "fill-foreground" : "fill-input")}
                    >
                      <polygon points={STAR} />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{LABELS[shown]}</span>
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="review-text">Your review</Label>
            <Textarea
              id="review-text"
              rows={4}
              maxLength={1000}
              placeholder="What did you like? How's the battery, the sound, the build?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-warning-soft px-3.5 py-3 text-sm font-medium text-warning"
            >
              {error}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="md" disabled={isLoading}>
              {isLoading ? "Posting…" : "Post review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
