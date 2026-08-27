"use client";

import { motion } from "framer-motion";
import { ParticleField } from "@/components/particle-field";

/**
 * Homepage hero. Dark theme, full-bleed background media, centered
 * quote overlay, subtle particle drift. Swap `backgroundSrc` for the
 * final video/photo asset when it's ready -- everything else in the
 * design system stays the same.
 */
export function Hero({
  quote,
  attribution,
  backgroundSrc,
}: {
  quote: string;
  attribution?: string;
  backgroundSrc?: string;
}) {
  return (
    <section className="theme-dark relative flex h-[92vh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-ink text-offwhite">
      {/* Background media placeholder -- swap for video/photo */}
      <div className="absolute inset-0">
        {backgroundSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundSrc}
            alt=""
            className="h-full w-full object-cover opacity-50"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_30%,_rgba(107,143,113,0.35),_transparent_60%),linear-gradient(180deg,_#0d1512_0%,_#122019_60%,_#0d1512_100%)]" />
        )}
        <div className="absolute inset-0 bg-ink/40" />
      </div>

      {/* Particle layer */}
      <ParticleField className="absolute inset-0" />

      {/* Quote overlay */}
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
