import { Container } from "@/components/layout";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-72" />
    </Container>
  );
}
