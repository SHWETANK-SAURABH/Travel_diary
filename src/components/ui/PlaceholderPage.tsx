import { Container } from "@/components/layout/Container";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <Container className="py-24">
      <h1 className="font-display text-h1">{title}</h1>
      <p className="mt-3 max-w-xl text-ink-muted">{description}</p>
    </Container>
  );
}
