"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import { FlipCard } from "@/components/flip-card";
import { RecycleConverge } from "@/components/recycle-converge";

// Defined together in this client module for the same reason as the other
// flip-grid components: the MATERIALS data below pairs each entry with a
// "type" used to pick an icon, and the grid that maps over it needs to live
// alongside the icon components in one client file.

type MaterialType =
  | "copper"
  | "precious"
  | "plastic"
  | "glass"
  | "aluminium"
  | "iron";

const MATERIALS: {
  type: MaterialType;
  material: string;
  destination: string;
}[] = [
  {
    type: "copper",
    material: "Copper",
    destination: "New wiring & electronics manufacturing",
  },
  {
    type: "precious",
    material: "Precious Metals",
    destination:
      "Gold, silver & palladium reintroduced into electronics manufacturing",
  },
  {
    type: "plastic",
    material: "Plastics",
    destination: "New product casings",
  },
  {
    type: "glass",
    material: "Glass & Circuit Boards",
    destination: "Recovered for industrial and construction use",
  },
  {
    type: "aluminium",
    material: "Aluminium",
    destination: "Remelted for new appliance and automotive parts",
  },
  {
    type: "iron",
    material: "Iron & Steel",
    destination: "Reprocessed into construction-grade steel",
  },
];

function MaterialIcon({ type, size }: { type: MaterialType; size: number }) {
  const common = { width: size, height: size, viewBox: "0 0 120 120" };
  const r = 52;
  const cx = 60;
  const cy = 60;
  const strokeWidth = size >= 70 ? 5 : 3;

  if (type === "copper")
    return (
      <svg {...common}>
        <circle cx={cx} cy={cy} r={r} fill="var(--color-brass)" fillOpacity={0.13} />
        <path
          d="M36 48 h48 M36 60 h48 M36 72 h48"
          stroke="var(--color-brass)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  if (type === "precious")
    return (
      <svg {...common}>
        <circle cx={cx} cy={cy} r={r} fill="var(--color-sage)" fillOpacity={0.13} />
        <circle cx={48} cy={55} r={size >= 70 ? 10 : 5} fill="var(--color-brass)" />
        <circle cx={72} cy={50} r={size >= 70 ? 8 : 4} fill="var(--color-sage)" />
        <circle cx={60} cy={76} r={size >= 70 ? 9 : 4.5} fill="var(--color-brass)" />
      </svg>
    );
  if (type === "plastic")
    return (
      <svg {...common}>
        <circle cx={cx} cy={cy} r={r} fill="var(--color-sage)" fillOpacity={0.13} />
        <path
          d="M42 42 h36 v36 h-36 z"
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </svg>
    );
  if (type === "aluminium")
    return (
      <svg {...common}>
        <circle cx={cx} cy={cy} r={r} fill="var(--color-ink)" fillOpacity={0.08} />
        <ellipse
          cx={cx}
          cy={cy}
          rx={30}
          ry={18}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity={0.6}
          strokeWidth={strokeWidth}
        />
        <ellipse
          cx={cx}
          cy={52}
          rx={30}
          ry={18}
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  if (type === "iron")
    return (
      <svg {...common}>
        <circle cx={cx} cy={cy} r={r} fill="var(--color-forest)" fillOpacity={0.1} />
        <rect x={40} y={44} width={40} height={12} rx={2} fill="var(--color-forest)" />
        <rect
          x={40}
          y={60}
          width={40}
          height={12}
          rx={2}
          fill="var(--color-forest)"
          fillOpacity={0.7}
        />
        <rect
          x={40}
          y={76}
          width={40}
          height={8}
          rx={2}
          fill="var(--color-forest)"
          fillOpacity={0.45}
        />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx={cx} cy={cy} r={r} fill="var(--color-forest)" fillOpacity={0.1} />
      <path
        d="M38 78 l14 -28 l12 16 l8 -12 l8 24 z"
        fill="none"
        stroke="var(--color-forest)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MaterialsSection() {
  return (
    <>
      <ScrollReveal delay={0.1}>
        <div className="mx-auto mb-8 w-32">
          <RecycleConverge color="#6B8F71" height={90} />
        </div>
      </ScrollReveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MATERIALS.map((m, i) => (
          <ScrollReveal key={m.material} delay={0.15 + i * 0.08}>
            <FlipCard
              title={m.material}
              className="h-[170px]"
              front={
                <div className="flex h-full items-start gap-4">
                  <MaterialIcon type={m.type} size={44} />
                  <div>
                    <h3 className="font-heading text-[0.95rem] font-semibold text-ink">
                      {m.material}
                    </h3>
                    <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink/60">
                      {m.destination}
                    </p>
                  </div>
                </div>
              }
              back={
                <>
                  <MaterialIcon type={m.type} size={84} />
                  <h3
                    className="text-center text-[0.88rem] font-semibold"
                    style={{ color: "#2F4A3E" }}
                  >
                    {m.material}
                  </h3>
                </>
              }
            />
          </ScrollReveal>
        ))}
      </div>
    </>
  );
}
