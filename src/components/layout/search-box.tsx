import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { paths } from "@/app/paths";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
  /** Show the "/" hint and focus the box when "/" is pressed. */
  shortcut?: boolean;
}

export function SearchBox({
  placeholder = "Search phones, laptops, headphones…",
  className,
  shortcut,
}: SearchBoxProps) {
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (q) navigate(paths.search(q));
      }}
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-md bg-muted px-3.5 text-muted-foreground focus-within:ring-[3px] focus-within:ring-primary/15",
        className,
      )}
    >
      <Search size={18} strokeWidth={2} aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        aria-label="Search products"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-[15px]"
      />
      {shortcut && (
        <kbd className="rounded-xs border border-input px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          /
        </kbd>
      )}
    </form>
  );
}
