"use client";

import { useEffect } from "react";

function reportError(error: Error) {
  fetch("/api/errors/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: error.message, stack: error.stack, path: typeof window !== "undefined" ? window.location.pathname : undefined }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Catches errors in the root layout itself (spec §32) — rare, since most
 * failures happen inside a page and are caught by src/app/error.tsx
 * instead. This one REPLACES the root layout when active, so it can't rely
 * on RootLayout's fonts/providers — deliberately plain, system-font markup.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#faf6ee", color: "#211d17", margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Something went wrong.</h1>
          <p style={{ color: "#6b6355", marginBottom: "1.5rem" }}>We&apos;ve logged the issue. Try again, or head back home.</p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            <button
              onClick={() => retry()}
              style={{ background: "#d97a1a", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.5rem 1rem", cursor: "pointer" }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- this file REPLACES the root layout when active, so it can't rely on next/link's router context being alive; a plain anchor is the one dependency-free way to offer an escape hatch here. */}
            <a href="/" style={{ border: "1px solid #e6ddc9", borderRadius: "0.5rem", padding: "0.5rem 1rem", color: "#211d17", textDecoration: "none" }}>
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
