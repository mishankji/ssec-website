"use client";

import { useEffect, useRef, useState } from "react";

const C = {
  primary: "#2F4A3E",
  green: "#3E8E52",
  sage: "#6B8F71",
  brass: "#C9A24B",
};

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

/**
 * A document with three lines ticking off one by one, then a certificate
 * seal dropping in. Plays once, driven by the `play` flag from the
 * scroll-into-view hook below. Keyframes live in globals.css alongside the
 * Our Process step animations.
 */
function ComplianceDoc({ play }: { play: boolean }) {
  return (
    <svg viewBox="0 0 220 220" width="220" height="220">
      {/* document outline */}
      <rect
        x="40"
        y="24"
        width="110"
        height="150"
        rx="6"
        fill="#fff"
        stroke={C.primary}
        strokeWidth="3"
        strokeDasharray="220"
        strokeDashoffset={play ? 0 : 220}
        style={play ? { animation: "docDraw 1s ease-out forwards" } : {}}
      />
      {/* three lines, each with a checkmark ticking in */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line
            x1="56"
            y1={58 + i * 26}
            x2="126"
            y2={58 + i * 26}
            stroke={C.sage}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40"
            strokeDashoffset={play ? 0 : 40}
            style={
              play
                ? {
                    animation: `lineDraw 0.5s ${0.6 + i * 0.35}s ease-out forwards`,
                    opacity: 0,
                  }
                : { opacity: 0 }
            }
          />
          <g
            style={
              play
                ? {
                    animation: `checkPop 0.3s ${0.95 + i * 0.35}s ease-out forwards`,
                    opacity: 0,
                    transformOrigin: `138px ${58 + i * 26}px`,
                  }
                : { opacity: 0 }
            }
          >
            <circle cx="138" cy={58 + i * 26} r="8" fill={`${C.green}22`} />
            <path
              d={`M134 ${58 + i * 26} l3 3 l6 -6`}
              fill="none"
              stroke={C.green}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      ))}
      {/* certificate seal dropping in */}
      <g
        style={
          play
            ? {
                animation: "sealDrop 1s 1.9s ease-out forwards",
                opacity: 0,
                transformOrigin: "150px 150px",
              }
            : { opacity: 0 }
        }
      >
        <circle cx="150" cy="150" r="34" fill={C.brass} />
        <circle
          cx="150"
          cy="150"
          r="34"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.6"
        />
        <path
          d="M136 150 l9 9 l16 -18"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function ComplianceIllustration() {
  const [ref, inView] = useInView(0.3);

  return (
    <div ref={ref}>
      <ComplianceDoc play={inView} />
    </div>
  );
}
