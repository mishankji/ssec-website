"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Card that flips top-over-bottom (rotateX) on hover to reveal a back face
 * on a light mint background. Perspective/preserve-3d/backface-visibility
 * are set via Tailwind arbitrary properties; the animated rotateX value
 * itself is inline since it depends on hover state. The parent grid must
 * not clip with overflow-hidden, or the 3D flip will look broken.
 *
 * By default the front renders an icon/title/description and the back
 * renders an Illustration above the title -- the shape used by the Service
 * Grid and Why Choose Us cards. Pass `front` and/or `back` to override
 * either face entirely (used e.g. for the About page's logo-front /
 * blob-accent-back and logo-back variants) while still sharing this same
 * flip mechanism.
 */
export function FlipCard({
  icon: Icon,
  title,
  description,
  Illustration,
  front,
  back,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  Illustration?: ComponentType;
  front?: ReactNode;
  back?: ReactNode;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={cn("h-[260px] [perspective:1200px]", className)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative h-full w-full [transform-style:preserve-3d] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)" }}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col rounded-2xl border border-forest/10 bg-white p-7 shadow-sm [backface-visibility:hidden]">
          {front ?? (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-forest/10">
                {Icon && <Icon size={20} className="text-forest" />}
              </div>
              <h3 className="font-heading mt-4 text-base font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-2 text-[0.87rem] leading-relaxed text-ink/60">
                {description}
              </p>
            </>
          )}
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl p-6 [backface-visibility:hidden]"
          style={{ background: "#DCEDE1", transform: "rotateX(180deg)" }}
        >
          {back ??
            (Illustration && (
              <>
                <Illustration />
                <h3
                  className="text-center text-[0.95rem] font-semibold"
                  style={{ color: "#2F4A3E" }}
                >
                  {title}
                </h3>
              </>
            ))}
        </div>
      </div>
    </div>
  );
}
