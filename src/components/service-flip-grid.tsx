"use client";

import { Truck, Lock, Wrench, Recycle, FileCheck, Handshake } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FlipCard } from "@/components/flip-card";
import {
  CollectionIllustration,
  DataDestructionIllustration,
  DismantlingIllustration,
  MetalScrapIllustration,
  EPRIllustration,
  BuybackIllustration,
} from "@/components/service-illustrations";

// Defined together with FlipCard in this client module because the
// Illustration/icon values are component references -- functions can't be
// passed as props from the (server) page component into a client component,
// so the whole data + render loop lives here instead.
const SERVICES = [
  {
    icon: Truck,
    title: "E-Waste Collection",
    description:
      "Scheduled pickup for both households and businesses across Jaipur and Rajasthan, any device, any volume.",
    Illustration: CollectionIllustration,
  },
  {
    icon: Lock,
    title: "ITAD & Data Destruction",
    description:
      "Certified IT asset disposition with secure data wiping and physical destruction of storage media, protecting client confidentiality.",
    Illustration: DataDestructionIllustration,
  },
  {
    icon: Wrench,
    title: "Dismantling & Material Recovery",
    description:
      "Expert disassembly of electronics to recover valuable metals, plastics, and components for reuse.",
    Illustration: DismantlingIllustration,
  },
  {
    icon: Recycle,
    title: "Metal Scrap Recycling & Trading",
    description:
      "Processing and trading of ferrous and non-ferrous metal scrap alongside our e-waste operations.",
    Illustration: MetalScrapIllustration,
  },
  {
    icon: FileCheck,
    title: "EPR Compliance",
    description:
      "End-to-end Extended Producer Responsibility documentation and reporting for manufacturers and brand owners.",
    Illustration: EPRIllustration,
  },
  {
    icon: Handshake,
    title: "Buyback Programs",
    description:
      "Fair-value buyback for functional and recoverable equipment from businesses looking to upgrade.",
    Illustration: BuybackIllustration,
  },
];

export function ServiceFlipGrid() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((item, i) => (
        <ScrollReveal key={item.title} delay={i * 0.08}>
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
