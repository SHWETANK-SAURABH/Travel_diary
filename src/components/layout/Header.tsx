"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { primaryNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Dropdown } from "@/components/ui";
import { Container } from "./Container";
import { ExploreMenu } from "./ExploreMenu";
import { HeaderSearch } from "./HeaderSearch";
import { AccountMenu } from "./AccountMenu";

export interface HeaderProps {
  /** Starts transparent (for a hero page) and turns solid once the user scrolls. Defaults to always-solid, which is correct for every page without a full-bleed hero. */
  transparentUntilScroll?: boolean;
}

export function Header({ transparentUntilScroll = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(!transparentUntilScroll);

  useEffect(() => {
    if (!transparentUntilScroll) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentUntilScroll]);

  const solid = !transparentUntilScroll || scrolled;

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-colors duration-base ${
        solid ? "border-border bg-paper" : "border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl font-medium text-ink">
          {siteConfig.name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <Dropdown
            trigger={
              <span className="flex items-center gap-1 text-sm text-ink-muted transition-colors duration-fast hover:text-ink">
                Explore
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            }
          >
            <ExploreMenu />
          </Dropdown>

          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-muted transition-colors duration-fast hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <HeaderSearch />
          <AccountMenu />
        </div>
      </Container>
    </header>
  );
}
