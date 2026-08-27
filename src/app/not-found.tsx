import Link from "next/link";
import { Container } from "@/components/layout";
import { EmptyState, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24">
      <EmptyState
        title="We couldn't find that page"
        description="It may have moved, or never existed."
        action={
          <Link href="/">
            <Button variant="outline">Back home</Button>
          </Link>
        }
      />
    </Container>
  );
}
