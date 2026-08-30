import { Container } from "@/components/layout";
import { Skeleton, SkeletonCard } from "@/components/ui";

export default function Loading() {
  return (
    <>
      <div className="border-b border-border bg-ink py-20">
        <Container>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-14 w-full max-w-2xl" />
          <Skeleton className="mt-3 h-5 w-72" />
        </Container>
      </div>
      <Container className="py-12">
        <div className="flex flex-col gap-14">
          {Array.from({ length: 2 }).map((_, section) => (
            <div key={section}>
              <Skeleton className="h-8 w-56" />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
