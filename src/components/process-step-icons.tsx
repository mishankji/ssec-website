"use client";

import type { ComponentType, CSSProperties } from "react";

// Keyframes for these animations live in globals.css (driveIn, wheelSpin,
// slideLeft, slideRight, drawLine, splitLeft, splitRight, fragmentIn,
// glowPulse, stampDrop, checkDraw) so they're defined once rather than
// injected per icon instance.

const C = {
  primary: "#2F4A3E",
  green: "#3E8E52",
  sage: "#6B8F71",
  brass: "#C9A24B",
  muted: "#5C6B62",
};

export type StepAnimType =
  | "collection"
  | "sorting"
  | "dismantling"
  | "recovery"
  | "certification";

function CollectionAnim({ playKey }: { playKey: number }) {
  return (
    <svg key={playKey} viewBox="0 0 100 60" width="72" height="44">
      <line
        x1="4"
        y1="48"
        x2="96"
        y2="48"
        stroke={C.muted}
        strokeWidth="1.5"
        opacity="0.3"
      />
      <g style={{ animation: "driveIn 1s ease-out forwards" }}>
        <rect
          x="20"
          y="24"
          width="34"
          height="16"
          rx="2"
          fill="none"
          stroke={C.primary}
          strokeWidth="2.2"
        />
        <path
          d="M54 30 h14 l8 8 v6 h-22 z"
          fill="none"
          stroke={C.sage}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <g
          style={{
            transformOrigin: "32px 44px",
            animation: "wheelSpin 0.5s linear infinite",
          }}
        >
          <circle
            cx="32"
            cy="44"
            r="5"
            fill="none"
            stroke={C.primary}
            strokeWidth="2"
          />
          <line x1="32" y1="40" x2="32" y2="48" stroke={C.primary} strokeWidth="1.4" />
        </g>
        <g
          style={{
            transformOrigin: "68px 44px",
            animation: "wheelSpin 0.5s linear infinite",
          }}
        >
          <circle
            cx="68"
            cy="44"
            r="5"
            fill="none"
            stroke={C.primary}
            strokeWidth="2"
          />
          <line x1="68" y1="40" x2="68" y2="48" stroke={C.primary} strokeWidth="1.4" />
        </g>
      </g>
    </svg>
  );
}

function SortingAnim({ playKey }: { playKey: number }) {
  return (
    <svg key={playKey} viewBox="0 0 100 60" width="72" height="44">
      <g
        style={{
          animation:
            "slideLeft 1.6s 0.4s ease-out forwards, sortIdleTop 2.4s 2s ease-in-out infinite",
        }}
      >
        <rect
          x="38"
          y="18"
          width="22"
          height="15"
          rx="1.5"
          fill="none"
          stroke={C.primary}
          strokeWidth="2"
        />
        <line x1="34" y1="33" x2="64" y2="33" stroke={C.primary} strokeWidth="2" />
      </g>
      <g
        style={{
          animation:
            "slideRight 1.6s 0.4s ease-out forwards, sortIdleBottom 2.4s 2s ease-in-out infinite",
        }}
      >
        <rect
          x="46"
          y="36"
          width="10"
          height="18"
          rx="2.5"
          fill="none"
          stroke={C.brass}
          strokeWidth="2"
        />
        <line x1="49" y1="50" x2="53" y2="50" stroke={C.brass} strokeWidth="1.6" />
      </g>
    </svg>
  );
}

function DismantlingAnim({ playKey }: { playKey: number }) {
  return (
    <svg key={playKey} viewBox="0 0 100 60" width="72" height="44">
      <g
        style={{
          animation:
            "splitLeft 1.8s ease-out forwards, dismantleIdleLeft 2.2s 1.8s ease-in-out infinite",
          transformOrigin: "36px 30px",
        }}
      >
        <path d="M20 18 h20 v24 h-20 z" fill="none" stroke={C.primary} strokeWidth="2.2" />
      </g>
      <g
        style={{
          animation:
            "splitRight 1.8s ease-out forwards, dismantleIdleRight 2.2s 1.8s ease-in-out infinite",
          transformOrigin: "64px 30px",
        }}
      >
        <path d="M60 18 h20 v24 h-20 z" fill="none" stroke={C.sage} strokeWidth="2.2" />
      </g>
      <line
        x1="50"
        y1="14"
        x2="50"
        y2="46"
        stroke={C.brass}
        strokeWidth="1.6"
        strokeDasharray="4 3"
        style={{
          animation:
            "drawLine 0.5s 0.9s ease-out forwards, dividerPulse 1.8s 1.4s ease-in-out infinite",
          strokeDashoffset: 60,
        }}
      />
    </svg>
  );
}

const RECOVERY_FRAGMENTS = [
  { fx: -30, fy: -18 },
  { fx: 30, fy: -14 },
  { fx: -28, fy: 16 },
  { fx: 26, fy: 18 },
  { fx: 0, fy: -26 },
];

function RecoveryAnim({ playKey }: { playKey: number }) {
  return (
    <svg key={playKey} viewBox="0 0 100 60" width="72" height="44">
      <circle
        cx="50"
        cy="30"
        r="10"
        fill="none"
        stroke={C.green}
        strokeWidth="2"
        style={{
          animation:
            "glowPulse 2s ease-out forwards, coreIdlePulse 2.2s 2s ease-in-out infinite",
        }}
      />
      {RECOVERY_FRAGMENTS.map((f, i) => (
        <rect
          key={i}
          x="47"
          y="27"
          width="6"
          height="6"
          rx="1.5"
          fill={i % 2 === 0 ? C.brass : C.sage}
          style={
            {
              "--fx": `${f.fx}px`,
              "--fy": `${f.fy}px`,
              animation: `fragmentIn 1.6s ${i * 0.08}s ease-in forwards`,
            } as CSSProperties
          }
        />
      ))}
    </svg>
  );
}

function CertificationAnim({ playKey }: { playKey: number }) {
  return (
    <svg key={playKey} viewBox="0 0 100 60" width="72" height="44">
      <rect
        x="30"
        y="10"
        width="30"
        height="38"
        rx="2"
        fill="none"
        stroke={C.primary}
        strokeWidth="2"
        strokeDasharray="140"
        style={{ animation: "drawLine 0.8s ease-out forwards", strokeDashoffset: 140 }}
      />
      <line x1="36" y1="20" x2="54" y2="20" stroke={C.sage} strokeWidth="1.6" opacity="0.7" />
      <line x1="36" y1="26" x2="54" y2="26" stroke={C.sage} strokeWidth="1.6" opacity="0.7" />
      <g
        style={{
          animation:
            "stampDrop 1.6s 0.6s ease-out forwards, stampIdlePulse 2s 2.2s ease-in-out infinite",
          opacity: 0,
        }}
      >
        <circle
          cx="66"
          cy="38"
          r="12"
          fill="none"
          stroke={C.brass}
          strokeWidth="2.4"
        />
        <path
          d="M60 38 l4 4 l8 -9"
          fill="none"
          stroke={C.brass}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="24"
          style={{
            animation: "checkDraw 1.6s 0.6s ease-out forwards",
            strokeDashoffset: 24,
          }}
        />
      </g>
    </svg>
  );
}

const STEP_ANIMS: Record<StepAnimType, ComponentType<{ playKey: number }>> = {
  collection: CollectionAnim,
  sorting: SortingAnim,
  dismantling: DismantlingAnim,
  recovery: RecoveryAnim,
  certification: CertificationAnim,
};

/**
 * Small sketch-style illustration for one Our Process step. Replays from
 * the start whenever `playKey` changes (remounting the SVG via key), then
 * holds its final frame. `playKey` is controlled by the parent so the
 * hover trigger can span the step's full clickable area, not just this
 * icon -- see ProcessTimeline, which bumps the key on hovering the whole
 * step block.
 */
export function ProcessStepIcon({
  type,
  playKey,
}: {
  type: StepAnimType;
  playKey: number;
}) {
  const Anim = STEP_ANIMS[type];
  return (
    <div className="flex h-[50px] items-center justify-center">
      <Anim playKey={playKey} />
    </div>
  );
}
