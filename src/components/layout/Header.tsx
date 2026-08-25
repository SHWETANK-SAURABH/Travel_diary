import Link from "next/link";
import { primaryNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="border-b border-border bg-paper">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl font-medium text-ink">
          {siteConfig.name}
        </Link>

        <nav aria-label="Primary" className="hidden gap-6 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
