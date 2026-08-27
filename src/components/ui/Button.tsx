import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-fast disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold-500",
  {
    variants: {
      // NB: declared before `variant` so a variant's own sizing (e.g. the
      // "text" variant's h-auto/px-0) wins the twMerge conflict over the
      // default size classes — cva concatenates classes in key-declaration
      // order, and cn()/twMerge keeps the last occurrence of a given
      // property.
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 shrink-0 p-0",
      },
      variant: {
        primary: "bg-marigold-500 text-white hover:bg-marigold-600 active:bg-marigold-600",
        secondary: "bg-navy-500 text-white hover:bg-navy-600 active:bg-navy-600",
        outline: "border border-border bg-transparent text-ink hover:bg-marigold-50 active:bg-marigold-50",
        ghost: "bg-transparent text-ink hover:bg-marigold-50 active:bg-marigold-50",
        destructive: "bg-danger text-white hover:opacity-90 active:opacity-90",
        text: "bg-transparent text-marigold-600 underline-offset-4 hover:underline px-0 h-auto",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
