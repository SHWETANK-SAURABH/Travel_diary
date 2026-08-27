"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SearchOverlay } from "@/components/ui";

/** Header's search trigger + the overlay foundation. Submitting routes to the real /search page — the overlay itself doesn't execute queries. */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors duration-fast hover:bg-marigold-50 hover:text-ink"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

      <SearchOverlay
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        onValueChange={setValue}
        onSubmit={(query) => {
          if (!query.trim()) return;
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          setOpen(false);
        }}
      />
    </>
  );
}
