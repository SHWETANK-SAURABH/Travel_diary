import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

/**
 * One Card primitive, styled per context via `variant` — discovery/feature/
 * compact/recommendation/map-preview from the Phase 2 card system. Content
 * density (how much padding CardHeader/CardContent use) is the caller's
 * choice via className, not baked into the variant, since a "compact" card
 * and a "feature" card differ mostly in surrounding context, not a fixed
 * padding scale.
 */
const cardVariants = cva("bg-paper-raised", {
  variants: {
    variant: {
      discovery: "rounded-lg border border-border shadow-card",
      feature: "rounded-lg border border-border shadow-panel",
      compact: "rounded-md border border-border",
      recommendation: "rounded-lg border-2 border-marigold-400 shadow-card",
      mapPreview: "rounded-none border-0 shadow-none",
    },
  },
  defaultVariants: { variant: "discovery" },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-h3 font-display", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}
