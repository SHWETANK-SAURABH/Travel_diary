"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout";
import { EmptyState, Button } from "@/components/ui";

function reportError(error: Error) {
  fetch("/api/errors/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: error.message, stack: error.stack, path: typeof window !== "undefined" ? window.location.pathname : undefined }),
    keepalive: true,
  }).catch(() => {
    // Best-effort — see src/lib/errors/index.ts.
  });
}

/**
 * Route-segment error boundary (spec §32: "capture... important client
 * errors") — catches render-time exceptions within the root layout's
 * children, so the Header/Footer stay intact rather than the whole page
 * going blank. `retry` (not `reset` — Next.js 16 renamed it; see AGENTS.md)
 * re-attempts rendering the failed segment.
 */
export default function ErrorBoundary({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const router = useRouter();

  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <Container className="py-24">
      <EmptyState
        title="Something went wrong."
        description="We've logged the issue. Try again, or head back home."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => retry()}>Try again</Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back home
            </Button>
          </div>
        }
      />
    </Container>
  );
}
