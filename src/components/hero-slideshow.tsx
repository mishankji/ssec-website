"use client";

import { useEffect, useState } from "react";

const DWELL_MS = 5500; // how long each photo holds before crossfading
const FADE_MS = 1300; // crossfade duration

/**
 * Blurred, auto-crossfading photo backdrop for the homepage hero.
 * Sits behind the dark overlay and particle layer -- reads as soft
 * atmosphere, not sharp detail.
 */
export function HeroSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length);
    }, DWELL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute -inset-1 scale-[1.02] transition-opacity ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover blur-[3px]"
          />
        </div>
      ))}
    </div>
  );
}
