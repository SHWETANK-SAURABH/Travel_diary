import { Container } from "@/components/layout";
import { Skeleton, SkeletonCard } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-56" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </Container>
  );
}
