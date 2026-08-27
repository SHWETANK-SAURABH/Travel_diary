"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout";
import { ErrorState } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24">
      <ErrorState
        title="Something went wrong loading this page."
        description="Try again, or head back and pick something else to explore."
        onRetry={reset}
      />
    </Container>
  );
}
