import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-md border border-border bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold-500",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
