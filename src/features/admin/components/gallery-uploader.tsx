import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CloudUpload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useUploadProductImageMutation } from "../admin-api";

const MAX_IMAGES = 8;
const MAX_MB = 5;

/**
 * Product photo gallery. Each file uploads on its own request (field
 * `my_file`); the returned Cloudinary URLs form `images`, in display order.
 * The first photo is the cover.
 */
export function GalleryUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [upload] = useUploadProductImageMutation();
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Uploads finish out of order; read the latest list when each one lands.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const addFiles = async (files: FileList | File[]) => {
    const room = MAX_IMAGES - value.length - uploading;
    const accepted = [...files].filter((f) => {
      if (!f.type.startsWith("image/")) return (toast.error(`${f.name} isn't an image`), false);
      if (f.size > MAX_MB * 1024 * 1024)
        return (toast.error(`${f.name} is over ${MAX_MB} MB`), false);
      return true;
    });
    if (accepted.length > room)
      toast(`Only ${MAX_IMAGES} photos per product — extra files were skipped`);
    const batch = accepted.slice(0, Math.max(room, 0));
    setUploading((n) => n + batch.length);
    await Promise.all(
      batch.map(async (file) => {
        try {
          const url = await upload(file).unwrap();
          latest.current = [...latest.current, url];
          onChange(latest.current);
        } catch (e) {
          toast.error(`${file.name}: ${getErrorMessage(e, "upload failed")}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  };

  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {(value.length > 0 || uploading > 0) && (
        <ul className="m-0 grid list-none grid-cols-3 gap-2.5 p-0 sm:grid-cols-4">
          {value.map((url, i) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg bg-tile"
            >
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="size-full object-contain p-2 mix-blend-multiply"
              />
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-1 top-1 flex justify-between opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                <span className="flex gap-1">
                  {i > 0 && (
                    <IconButton
                      label={`Move photo ${i + 1} earlier`}
                      onClick={() => move(i, i - 1)}
                    >
                      <ArrowLeft size={14} />
                    </IconButton>
                  )}
                  {i < value.length - 1 && (
                    <IconButton label={`Move photo ${i + 1} later`} onClick={() => move(i, i + 1)}>
                      <ArrowRight size={14} />
                    </IconButton>
                  )}
                </span>
                <IconButton
                  label={`Remove photo ${i + 1}`}
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  <X size={14} />
                </IconButton>
              </div>
            </li>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <li
              key={`up-${i}`}
              className="flex aspect-square items-center justify-center rounded-lg bg-tile text-muted-foreground"
            >
              <Loader2 className="size-5 animate-spin" aria-label="Uploading" />
            </li>
          ))}
        </ul>
      )}

      {value.length + uploading < MAX_IMAGES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-sm transition-colors",
            dragging ? "border-primary bg-primary-tint" : "border-border-strong hover:bg-muted",
          )}
        >
          <CloudUpload size={28} strokeWidth={1.6} aria-hidden="true" />
          <span className="font-medium">Drag & drop or click to add photos</span>
          <span className="text-xs text-muted-foreground">
            Up to {MAX_IMAGES} · JPG, PNG or WebP · {MAX_MB} MB each · white backgrounds look best
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm hover:bg-card"
    >
      {children}
    </button>
  );
}
