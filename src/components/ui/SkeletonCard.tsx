import { Card, CardContent, CardHeader } from "./Card";
import { Skeleton } from "./Skeleton";

/** Composed loading state for a discovery card (image + title + meta line) — the shape used for festival/destination grids. */
export function SkeletonCard() {
  return (
    <Card>
      <Skeleton className="aspect-4/3 w-full rounded-t-lg rounded-b-none" />
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}
