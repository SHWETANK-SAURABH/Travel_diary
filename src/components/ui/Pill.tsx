import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** A clickable filter chip — e.g. category/month/popularity filters. Not to be confused with Badge, which is a static label. */
export const Pill = forwardRef<HTMLButtonElement, PillProps>(
  ({ className, selected, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors duration-fast",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold-500",
        selected
          ? "border-marigold-500 bg-marigold-500 text-white"
          : "border-border bg-transparent text-ink hover:bg-marigold-50",
        className
      )}
      {...props}
    />
  )
);
Pill.displayName = "Pill";
