"use client";

import { useState } from "react";
import { ResponsiveImage } from "./ResponsiveImage";
import { Modal } from "./Modal";

export interface GalleryImage {
  url: string;
  altText: string | null;
}

/** Compact grid + lightbox `Modal` — shared by festival and destination detail pages. The hero already shows images[0], so this renders images[1:]. */
export function Gallery({ images, contentName }: { images: GalleryImage[]; contentName: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length <= 1) return null; // the hero already shows the one image — no separate gallery needed

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.slice(1, 9).map((image, i) => (
          <button key={image.url} type="button" onClick={() => setOpenIndex(i + 1)} className="text-left">
            <ResponsiveImage
              src={image.url}
              alt={image.altText ?? `${contentName} photo ${i + 2}`}
              aspectRatio="1/1"
              containerClassName="rounded-md"
              className="rounded-md"
            />
          </button>
        ))}
      </div>

      <Modal open={openIndex !== null} onClose={() => setOpenIndex(null)} className="w-[min(48rem,92vw)]">
        {openIndex !== null && (
          <ResponsiveImage
            src={images[openIndex].url}
            alt={images[openIndex].altText ?? `${contentName} photo ${openIndex + 1}`}
            aspectRatio="3/2"
            priority
          />
        )}
      </Modal>
    </>
  );
}
