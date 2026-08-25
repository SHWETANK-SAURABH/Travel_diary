"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

/**
 * Client-side provider tree. Kept intentionally thin:
 *  - React Query owns *server* state (fetched content, caching, revalidation).
 *  - SessionProvider exposes the Auth.js session to client components.
 * UI state and guest state are handled by per-feature zustand stores
 * instead of a top-level provider — see src/lib/guest and each feature's
 * store, so this tree never grows into a global state dumping ground.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000 },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
