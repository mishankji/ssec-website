"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const DWELL_MS = 4000; // how long each photo holds before crossfading
const FADE_MS = 1000; // crossfade duration

/**
 * Small, self-contained photo slideshow -- crossfades automatically on a
 * timer, no controls. Sharp/unblurred, unlike the hero background version.
 */
export function PhotoSlideshow({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length);
    }, DWELL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl bg-sage/10 ring-1 ring-forest/10" +
        (className ? ` ${className}` : "")
      }
    >
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
