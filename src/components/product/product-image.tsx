import { useState } from "react";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
  /** Size of the placeholder glyph shown when there's no photo. */
  iconSize?: number;
  iconStroke?: number;
  imgClassName?: string;
  loading?: "lazy" | "eager";
}

/**
 * The warm-grey "studio" tile every product photo sits on. Most supplier
 * photos have white backgrounds; `mix-blend-multiply` turns that white into
 * the tile colour so photos blend in instead of showing as bright boxes.
 */
export function ProductImage({
  src,
  alt,
  category,
  className,
  iconSize = 96,
  iconStroke = 0.9,
  imgClassName,
  loading = "lazy",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = src && !failed;

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-tile text-subtle",
        className,
      )}
    >
      {showPhoto ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn("size-full object-contain p-[12%] mix-blend-multiply", imgClassName)}
        />
      ) : (
        <CategoryIcon category={category} size={iconSize} strokeWidth={iconStroke} />
      )}
    </div>
  );
}
