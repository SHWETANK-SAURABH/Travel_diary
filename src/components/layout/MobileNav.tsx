"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Map, Luggage, User } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { ResponsivePanel } from "@/components/ui";
import { exploreNav } from "@/config/nav";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Map", href: "/map", icon: Map },
  { label: "Trips", href: "/trips", icon: Luggage },
  { label: "Profile", href: "/profile", icon: User },
] as const;

/** Mobile-only bottom navigation — large touch targets, not a shrunk version of the desktop header nav. Explore opens the discovery bottom sheet rather than navigating directly. */
export function MobileNav() {
  const pathname = usePathname();
  const [exploreOpen, setExploreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-border bg-paper-raised md:hidden"
      >
        <button
          type="button"
          onClick={() => setExploreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={exploreOpen}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-label text-ink-muted"
        >
          <Compass className="h-5 w-5" aria-hidden="true" />
          Explore
        </button>

        {items.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-label",
                active ? "text-marigold-600" : "text-ink-muted"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <ResponsivePanel open={exploreOpen} onClose={() => setExploreOpen(false)}>
        <div className="p-4">
          <p className="mb-2 text-h3 font-display">Explore</p>
          <ul>
            {exploreNav.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setExploreOpen(false)}
                    className="block border-b border-border py-3 text-base text-ink last:border-b-0"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex items-center justify-between border-b border-border py-3 text-base text-ink-muted/60 last:border-b-0">
                    {item.label}
                    <span className="text-label">Soon</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </ResponsivePanel>
    </>
  );
}
