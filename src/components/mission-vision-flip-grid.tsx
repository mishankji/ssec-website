"use client";

import { Target, Eye } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FlipCard } from "@/components/flip-card";
import { FlipBackAccent } from "@/components/flip-back-accent";

// Defined together with FlipCard in this client module for the same reason
// as ServiceFlipGrid: the icon values are component references, which
// can't be passed as props from the (server) page component into a client
// component.
const MISSION_VISION = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make responsible e-waste disposal accessible and accountable for every business and household in Rajasthan.",
    accent: "#3E8E52",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "A future where no electronic device ends up in a landfill or an informal, unsafe recycling chain.",
    accent: "#C9A24B",
  },
];

export function MissionVisionFlipGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {MISSION_VISION.map((item, i) => (
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
