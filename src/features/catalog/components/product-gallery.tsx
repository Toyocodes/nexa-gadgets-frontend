import { useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

interface GalleryProps {
  images: string[];
  title: string;
  category: string;
  /** Overlay controls for the mobile carousel (e.g. the wishlist heart). */
  mobileOverlay?: React.ReactNode;
}

export function ProductGallery({ images, title, category, mobileOverlay }: GalleryProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const many = images.length > 1;

  return (
    <>
      {/* Desktop: main photo + thumbnails */}
      <div className="hidden min-w-0 flex-[1_1_560px] flex-col gap-3 md:flex">
        {images.length ? (
          <ProductImage
            src={images[active]}
            alt={title}
            category={category}
            loading="eager"
            iconSize={180}
            iconStroke={0.6}
            className="aspect-square rounded-3xl"
          />
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl bg-tile text-subtle">
            <ImageOff size={64} strokeWidth={1} aria-hidden="true" />
            <span className="text-[13px] text-muted-foreground">No photo yet</span>
          </div>
        )}
        {many && (
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 8).map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-[14px] border-2 bg-tile",
                  i === active ? "border-foreground" : "border-transparent hover:border-input",
                )}
              >
                <img
                  src={src}
                  alt=""
                  className="size-full object-contain p-[10%] mix-blend-multiply"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: full-bleed swipe carousel with dots */}
      <div className="relative md:hidden">
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {(images.length ? images : [""]).map((src, i) => (
            <ProductImage
              key={src + i}
              src={src || null}
              alt={i === 0 ? title : `${title}, photo ${i + 1}`}
              category={category}
              loading={i === 0 ? "eager" : "lazy"}
              iconSize={150}
              iconStroke={0.7}
              className="aspect-square w-full flex-none snap-center"
            />
          ))}
        </div>
        {mobileOverlay}
        {many && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5"
          >
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-5 bg-foreground" : "w-1.5 bg-border-strong",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
