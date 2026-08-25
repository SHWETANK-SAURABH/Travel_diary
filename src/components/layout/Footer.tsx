import { siteConfig } from "@/config/site";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-8">
      <Container className="flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <p>{siteConfig.tagline}</p>
      </Container>
    </footer>
  );
}
