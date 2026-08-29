import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

export interface DisclosureProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Progressive-disclosure section — built on native <details>/<summary> so
 * keyboard/screen-reader behavior comes free, per the "reusable expandable
 * sections" requirement (festival/destination pages: Story, What to
 * Expect, How to Reach, ...). Renders nothing if it has no real children —
 * callers should conditionally render this at the call site rather than
 * passing empty content, so an absent section never shows as an empty
 * expandable shell.
 */
export function Disclosure({ title, children, defaultOpen = false, className }: DisclosureProps) {
  return (
    <details open={defaultOpen} className={cn("group border-b border-border py-4", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between text-h3 font-display text-ink marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 text-ink-muted transition-transform duration-base group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="animate-fade-in mt-3 text-body text-ink">{children}</div>
    </details>
  );
}
