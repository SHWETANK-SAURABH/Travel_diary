"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
}
interface NavSection {
  label?: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  { items: [{ href: "/admin", label: "Dashboard" }] },
  {
    label: "Content",
    items: [
      { href: "/admin/festivals", label: "Festivals" },
      { href: "/admin/destinations", label: "Destinations" },
      { href: "/admin/experiences", label: "Experiences" },
      { href: "/admin/food", label: "Food" },
      { href: "/admin/locations", label: "Locations" },
    ],
  },
  { items: [{ href: "/admin/media", label: "Media" }] },
  {
    label: "Taxonomy",
    items: [
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/tags", label: "Tags" },
    ],
  },
  { items: [{ href: "/admin/verification", label: "Verification" }] },
  { label: "Settings", items: [{ href: "/admin/audit", label: "Audit log" }] },
];

/** Spec §43's exact nav shape, kept deliberately simple (no nested collapse state, no icons required to scan it). */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="w-48 shrink-0">
      <Link href="/" className="mb-6 block text-sm text-ink-muted hover:text-ink">
        ← Back to site
      </Link>
      <div className="flex flex-col gap-5">
        {NAV.map((section, i) => (
          <div key={i}>
            {section.label && <p className="mb-1 px-2 text-label font-medium tracking-wide text-ink-muted uppercase">{section.label}</p>}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-sm transition-colors duration-fast",
                      active ? "bg-marigold-50 font-medium text-marigold-600" : "text-ink hover:bg-marigold-50/60"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
