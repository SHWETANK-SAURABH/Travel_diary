import type { ComponentProps, ReactNode } from "react";

export interface SearchResultGroupProps {
  label: string;
  children: ReactNode;
}

/** Groups results under a heading, e.g. "Festivals", "Destinations", "Cities". */
export function SearchResultGroup({ label, children }: SearchResultGroupProps) {
  return (
    <div className="border-b border-border py-2 last:border-b-0">
      <p className="px-3 pb-1 text-label font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      <ul>{children}</ul>
    </div>
  );
}

export function SearchResultItem({ children, ...props }: ComponentProps<"a">) {
  return (
    <li>
      <a className="block px-3 py-2 text-sm text-ink transition-colors duration-fast hover:bg-marigold-50" {...props}>
        {children}
      </a>
    </li>
  );
}
