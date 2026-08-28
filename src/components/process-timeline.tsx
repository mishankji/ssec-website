"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProcessStepIcon, type StepAnimType } from "@/components/process-step-icons";

type Step = {
  title: string;
  description: string;
  animType: StepAnimType;
};

// Total time for the connector line to draw itself, once the section
// scrolls into view. Step circles light up in sync with the line's
// progress, computed from each step's position along the sequence.
const LINE_DURATION_MS = 1800;

export function ProcessTimeline({ steps }: { steps: readonly Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // One replay counter per step -- bumping it remounts that step's sketch
  // animation (via key) so it plays from the start on every hover.
  const [playKeys, setPlayKeys] = useState<number[]>(() => steps.map(() => 0));

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
              onMouseEnter={() =>
                setPlayKeys((prev) =>
                  prev.map((v, idx) => (idx === i ? v + 1 : v))
                )
              }
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

              {/* Icon + number circle grouped together -- on desktop
                  "contents" lets them fall back into the parent's centered
                  column as direct siblings of the text block below. */}
              <div className="flex flex-col items-center gap-1 md:contents">
                <ProcessStepIcon type={step.animType} playKey={playKeys[i]} />

                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-heading text-lg font-semibold transition-colors duration-500 ease-out",
                    inView ? "bg-forest text-offwhite" : "bg-ink/10 text-ink/40"
                  )}
                  style={{ transitionDelay: `${delay}ms` }}
                >
                  {i + 1}
                </div>
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
