"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description: string;
};

// Total time for the connector line to draw itself, once the section
// scrolls into view. Step circles light up in sync with the line's
// progress, computed from each step's position along the sequence.
const LINE_DURATION_MS = 1800;

export function ProcessTimeline({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative mt-16">
      {/* Connector line -- horizontal on desktop, drawn left to right */}
      <div
        className="absolute left-[10%] right-[10%] top-6 hidden h-[2px] bg-ink/10 md:block"
        aria-hidden
      >
        <div
          className="h-full origin-left bg-forest transition-transform ease-out"
          style={{
            transform: inView ? "scaleX(1)" : "scaleX(0)",
            transitionDuration: `${LINE_DURATION_MS}ms`,
          }}
        />
      </div>

      <div className="grid gap-10 md:grid-cols-5 md:gap-6">
        {steps.map((step, i) => {
          const delay = (i / (steps.length - 1)) * LINE_DURATION_MS;
          return (
            <div
              key={step.title}
              className="relative flex gap-4 md:flex-col md:items-center md:gap-0 md:text-center"
            >
              {/* Connector segment -- vertical on mobile, drawn top to bottom */}
              {i < steps.length - 1 && (
                <div
                  className="absolute left-6 top-12 h-[calc(100%+1.5rem)] w-[2px] bg-ink/10 md:hidden"
                  aria-hidden
                >
                  <div
                    className="h-full w-full origin-top bg-forest transition-transform ease-out"
                    style={{
                      transform: inView ? "scaleY(1)" : "scaleY(0)",
                      transitionDuration: `${LINE_DURATION_MS / (steps.length - 1)}ms`,
                      transitionDelay: `${delay}ms`,
                    }}
                  />
                </div>
              )}

              <div
                className={cn(
                  "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-heading text-lg font-semibold transition-colors duration-500 ease-out",
                  inView ? "bg-forest text-offwhite" : "bg-ink/10 text-ink/40"
                )}
                style={{ transitionDelay: `${delay}ms` }}
              >
                {i + 1}
              </div>

              <div className="md:mt-4">
                <h3 className="font-heading text-base font-semibold text-forest">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink/70">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
