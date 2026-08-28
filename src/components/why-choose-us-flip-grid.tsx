"use client";

import { Award, Eye, ShieldCheck, Repeat } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FlipCard } from "@/components/flip-card";
import {
  CertifiedIllustration,
  TraceableIllustration,
  SecureIllustration,
  CircularEconomyIllustration,
} from "@/components/why-choose-us-illustrations";

// Defined together with FlipCard in this client module for the same reason
// as ServiceFlipGrid: the icon/Illustration values are component
// references, which can't be passed as props from the (server) page
// component into a client component.
const WHY_CHOOSE_US = [
  {
    icon: Award,
    title: "Certified & Compliant",
    description:
      "Licensed under CTO (Rajasthan SPCB) and EPR (CPCB), with ISO 45001 and ISO 14001 certification.",
    Illustration: CertifiedIllustration,
  },
  {
    icon: Eye,
    title: "Traceable Process",
    description:
      "Full visibility into where your e-waste goes and how it's processed, from pickup to final recovery.",
    Illustration: TraceableIllustration,
  },
  {
    icon: ShieldCheck,
    title: "Secure Handling",
    description:
      "Certified data destruction and secure chain-of-custody for sensitive IT assets.",
    Illustration: SecureIllustration,
  },
  {
    icon: Repeat,
    title: "Circular Economy Focus",
    description:
      "We prioritize material recovery and reuse over disposal, keeping resources in circulation.",
    Illustration: CircularEconomyIllustration,
  },
];

export function WhyChooseUsFlipGrid() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {WHY_CHOOSE_US.map((item, i) => (
        <ScrollReveal key={item.title} delay={i * 0.1}>
          <FlipCard
            icon={item.icon}
            title={item.title}
            description={item.description}
            Illustration={item.Illustration}
          />
        </ScrollReveal>
      ))}
    </div>
  );
}
