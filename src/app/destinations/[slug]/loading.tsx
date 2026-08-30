import { Container } from "@/components/layout";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <>
      <Skeleton className="aspect-21/9 max-h-112 w-full rounded-none" />
      <Container className="py-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-3 h-10 w-2/3" />
        <Skeleton className="mt-2 h-5 w-1/3" />
        <Skeleton className="mt-6 h-20 w-full max-w-2xl" />
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </Container>
    </>
  );
}
