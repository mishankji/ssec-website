"use client";

import { motion } from "framer-motion";
import { ParticleField } from "@/components/particle-field";
import { HeroSlideshow } from "@/components/hero-slideshow";

// Background photos for the hero slideshow, in public/hero/.
const HERO_IMAGES = [
  "/hero/hero-team-sorting.jpg",
  "/hero/hero-ac-units.jpg",
  "/hero/hero-collection-drive.jpg",
];

/**
 * Homepage hero. Dark theme, full-bleed blurred photo slideshow with a
 * dark gradient overlay, particle drift on top, centered quote overlay.
 */
export function Hero({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  return (
    <section className="theme-dark relative flex h-[92vh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-ink text-offwhite">
      {/* Layer 1: blurred photo slideshow, on a gradient base color so
          there's no flash before the first photo paints. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(107,143,113,0.35), transparent 60%), linear-gradient(180deg, #0d1512 0%, #122019 60%, #0d1512 100%)",
        }}
      >
        <HeroSlideshow images={HERO_IMAGES} />
        {/* Layer 2: dark overlay, keeps the quote text readable. */}
        <div className="absolute inset-0 bg-ink/40" />
      </div>

      {/* Layer 3: particle drift, crisp and unblurred, on top of the photos. */}
      <ParticleField className="absolute inset-0" />

      {/* Layer 4: quote overlay */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-3xl font-semibold leading-tight tracking-tight text-offwhite md:text-5xl lg:text-6xl"
        >
          {quote}
        </motion.p>
        {attribution && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-6 text-sm uppercase tracking-[0.2em] text-vivid"
          >
            {attribution}
          </motion.p>
        )}
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-9 w-5 rounded-full border border-offwhite/40 p-1">
          <div className="h-1.5 w-1.5 rounded-full bg-vivid" />
        </div>
      </motion.div>
    </section>
  );
}
