import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "./Container";

const columns = [
  {
    heading: "Explore",
    links: [
      { label: "Festivals", href: "/festivals" },
      { label: "Destinations", href: "/destinations" },
      { label: "Hidden India", href: "/hidden-india" },
      { label: "Map", href: "/map" },
    ],
  },
  {
    heading: "Plan",
    links: [
      { label: "Trips", href: "/trips" },
      { label: "Calendar", href: "/calendar" },
    ],
  },
  {
    heading: "About",
    links: [{ label: "About TravelDiary", href: "/explore" }],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-12">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-lg text-ink">{siteConfig.name}</p>
            <p className="mt-1 text-caption text-ink-muted">{siteConfig.tagline}</p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <p className="text-label font-medium tracking-wide text-ink-muted uppercase">{column.heading}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-caption text-ink transition-colors duration-fast hover:text-marigold-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-caption text-ink-muted">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </Container>
    </footer>
  );
}
