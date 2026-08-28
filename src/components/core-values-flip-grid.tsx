"use client";

import { Leaf, ShieldCheck, Lightbulb, HeartHandshake } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FlipCard } from "@/components/flip-card";
import { FlipBackAccent } from "@/components/flip-back-accent";

// Defined together with FlipCard in this client module for the same reason
// as ServiceFlipGrid: the icon values are component references, which
// can't be passed as props from the (server) page component into a client
// component.
const CORE_VALUES = [
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Environmentally responsible practices in everything we do.",
    accent: "#6B8F71",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    description: "Transparency, honesty, and the highest ethical standards.",
    accent: "#C9A24B",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "Continuously improving processes to maximize resource recovery.",
    accent: "#3E8E52",
  },
  {
    icon: HeartHandshake,
    title: "Collaboration",
    description:
      "Working with clients, regulators, and communities toward shared goals.",
    accent: "#6B8F71",
  },
];

export function CoreValuesFlipGrid() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CORE_VALUES.map((item, i) => (
        <ScrollReveal key={item.title} delay={i * 0.1}>
          <FlipCard
            icon={item.icon}
            title={item.title}
            description={item.description}
            back={<FlipBackAccent title={item.title} accent={item.accent} />}
          />
        </ScrollReveal>
      ))}
    </div>
  );
}
