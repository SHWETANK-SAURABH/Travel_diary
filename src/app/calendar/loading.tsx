import { Container } from "@/components/layout";
import { Skeleton, SkeletonCard } from "@/components/ui";

export default function Loading() {
  return (
    <>
      <div className="border-b border-border bg-marigold-50 py-16">
        <Container>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-11 w-64" />
          <Skeleton className="mt-3 h-5 w-80" />
        </Container>
      </div>
      <Container className="py-12">
        <Skeleton className="h-8 w-full max-w-xl" />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </Container>
    </>
  );
}
