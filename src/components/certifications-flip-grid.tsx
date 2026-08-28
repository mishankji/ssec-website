"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FlipCard } from "@/components/flip-card";

// Defined together with FlipCard in this client module for the same reason
// as ServiceFlipGrid: the front/back overrides below are JSX built from
// these logo paths, and can't be passed as props from the (server) page
// component into a client component.
const CERTIFICATIONS = [
  {
    logo: "/certifications/rspcb.png",
    title: "CTO Authorization",
    description: "Rajasthan State Pollution Control Board",
  },
  {
    logo: "/certifications/cpcb.png",
    title: "EPR Authorization",
    description: "Central Pollution Control Board",
  },
  {
    logo: "/certifications/iso-45001.png",
    title: "ISO 45001",
    description: "Occupational Health & Safety Management System",
  },
  {
    logo: "/certifications/iso-14001.png",
    title: "ISO 14001",
    description: "Environmental Management System",
  },
];

export function CertificationsFlipGrid() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CERTIFICATIONS.map((item, i) => (
        <ScrollReveal key={item.title} delay={i * 0.1}>
          <FlipCard
            title={item.title}
            front={
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="relative h-14 w-14">
                  <Image
                    src={item.logo}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </div>
                <h3 className="font-heading mt-4 text-lg font-semibold text-forest">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70">{item.description}</p>
              </div>
            }
            back={
              <>
                <div className="relative h-20 w-20">
                  <Image
                    src={item.logo}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
                <p
                  className="text-center text-sm font-semibold"
                  style={{ color: "#2F4A3E" }}
                >
                  {item.title}
                </p>
              </>
            }
          />
        </ScrollReveal>
      ))}
    </div>
  );
}
