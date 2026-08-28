import type { Metadata } from "next";
import Image from "next/image";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Card } from "@/components/card";

export const metadata: Metadata = {
  title: "Sustainability",
  description: "S S Enviro Care's approach to sustainable, certified e-waste processing.",
};

const GALLERY = [
  {
    src: "/hero/hero-collection-drive.jpg",
    caption:
      "E-Waste Awareness and Collection Drive, run with RSPCB and corporate partners.",
  },
  {
    src: "/hero/hero-ac-units.jpg",
    caption: "Recovered appliances processed at our Jaipur facility.",
  },
  {
    src: "/hero/hero-team-sorting.jpg",
    caption:
      "Our team sorting and preparing devices for certified dismantling.",
  },
];

const SDGS = [
  {
    number: "SDG 12",
    title: "Responsible Consumption & Production",
    description: "Keeping resources in circulation instead of landfills.",
  },
  {
    number: "SDG 13",
    title: "Climate Action",
    description: "Recycling reduces the footprint of raw material extraction.",
  },
  {
    number: "SDG 11",
    title: "Sustainable Cities & Communities",
    description: "Collection drives and city-level e-waste infrastructure.",
  },
  {
    number: "SDG 8",
    title: "Decent Work & Economic Growth",
    description: "Formalizing safe, trained e-waste handling.",
  },
  {
    number: "SDG 9",
    title: "Industry, Innovation & Infrastructure",
    description: "Certified dismantling and recovery processes.",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      <Section className="pt-32 md:pt-40">
        <ScrollReveal>
          <Eyebrow>Sustainability</Eyebrow>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold text-forest md:text-5xl">
            Sustainability page -- content coming soon.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">
            This page is scaffolded with the site&apos;s design system and
            ready for the finished Sustainability content and layout.
          </p>
        </ScrollReveal>
      </Section>

      <Section>
        <ScrollReveal>
          <Eyebrow>On The Ground</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Collection Drives & Awareness Campaigns
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {GALLERY.map((item, i) => (
            <ScrollReveal key={item.src} delay={i * 0.1}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sage/10">
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-sm text-ink/70">{item.caption}</p>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal>
          <Eyebrow>The Bigger Picture</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Aligned with Global Goals & National Policy
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {SDGS.map((item, i) => (
            <ScrollReveal key={item.number} delay={i * 0.1}>
              <Card>
                <span className="inline-block rounded-full bg-brass/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brass">
                  {item.number}
                </span>
                <h4 className="font-heading mt-4 text-base font-semibold text-forest">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-ink/70">{item.description}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Section>
    </>
  );
}
