import type { HTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

/** Standard content width — the default reading/browsing measure for most pages. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

/** Wider editorial measure — for content-dense discovery sections that want more breathing room than Container. */
export function WideSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

/** Edge-to-edge — hero imagery, the map. No horizontal padding, no max-width. */
export function FullBleed({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full", className)} {...props} />;
}

/** Fills the viewport below the header — the map's layout, and anything else that needs a fixed, non-scrolling canvas. */
export function FullScreenSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("h-[calc(100vh-4rem)] w-full", className)} {...props} />;
}
