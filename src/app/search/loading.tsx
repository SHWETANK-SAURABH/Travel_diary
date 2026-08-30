import { Container } from "@/components/layout";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-6 h-11 max-w-md" />
      <div className="mt-6 flex max-w-md flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </Container>
  );
}
