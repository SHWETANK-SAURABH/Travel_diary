import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const badgeVariants = cva("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-border/60 text-ink",
      marigold: "bg-marigold-50 text-marigold-600",
      navy: "bg-navy-500/10 text-navy-500",
      terracotta: "bg-terracotta-500/10 text-terracotta-500",
      success: "bg-success/10 text-success",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
