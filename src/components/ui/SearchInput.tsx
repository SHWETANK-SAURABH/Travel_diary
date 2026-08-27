import { forwardRef, type InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "./cn";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, ...props }, ref) => (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={value}
        className={cn(
          "h-11 w-full rounded-md border border-border bg-paper-raised pr-9 pl-9 text-sm text-ink placeholder:text-ink-muted",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold-500",
          className
        )}
        {...props}
      />
      {onClear && typeof value === "string" && value.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
);
SearchInput.displayName = "SearchInput";
