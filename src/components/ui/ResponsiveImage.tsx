"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "./cn";
import { Skeleton } from "./Skeleton";

export interface ResponsiveImageProps extends Omit<ImageProps, "alt" | "onLoad" | "onError" | "fill"> {
  /** Required — never render decorative content images without alt text. */
  alt: string;
  /** e.g. "16/9", "4/3", "1/1". Defaults to 4/3, the common card ratio. */
  aspectRatio?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Wraps next/image with the plumbing the spec asks for: aspect-ratio box
 * (no layout shift), a skeleton while loading, and a graceful fallback if
 * the source 404s — instead of a broken-image icon. Not yet wired to a real
 * CDN loader; see src/lib/media for that boundary.
 */
export function ResponsiveImage({
  alt,
  aspectRatio = "4/3",
  className,
  containerClassName,
  priority,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  ...props
}: ResponsiveImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className={cn("relative overflow-hidden bg-border/30", containerClassName)} style={{ aspectRatio }}>
      {status === "loading" && <Skeleton className="absolute inset-0 rounded-none" />}

      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-ink-muted">
          Image unavailable
        </div>
      ) : (
        <Image
          {...props}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={cn("object-cover", status === "loading" ? "opacity-0" : "opacity-100", "transition-opacity duration-base", className)}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  );
}
