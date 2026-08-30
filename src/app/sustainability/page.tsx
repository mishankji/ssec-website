import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Card } from "@/components/card";
import { RecycleConverge } from "@/components/recycle-converge";
import { SustainabilityHeaderBG } from "@/components/sustainability-header-bg";
import { MaterialsSection } from "@/components/sustainability-materials";
import { EquivalenciesSection } from "@/components/sustainability-equivalencies";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "S S Enviro Care's approach to sustainable, certified e-waste processing, covering circularity, climate commitments, and community impact.",
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
    n: 12,
    title: "Responsible Consumption\n& Production",
    color: "#BF8B2E",
    desc: "Keeping resources in circulation instead of landfills.",
  },
  {
    n: 13,
    title: "Climate Action",
    color: "#3F7E44",
    desc: "Recycling reduces the footprint of raw material extraction.",
  },
  {
    n: 11,
    title: "Sustainable Cities\n& Communities",
    color: "#FD9D24",
    desc: "Collection drives and city-level e-waste infrastructure.",
  },
  {
    n: 8,
    title: "Decent Work &\nEconomic Growth",
    color: "#A21942",
    desc: "Formalizing safe, trained e-waste handling.",
  },
  {
    n: 9,
    title: "Industry, Innovation\n& Infrastructure",
    color: "#FD6925",
    desc: "Certified dismantling and recovery processes.",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      <Section className="relative overflow-hidden pt-32 text-center md:pt-40">
        <SustainabilityHeaderBG />
        <div className="relative z-10">
          <ScrollReveal>
            <Eyebrow>Sustainability</Eyebrow>
            <h1 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-semibold leading-tight text-forest md:text-5xl">
              Sustainability isn&apos;t an afterthought. It&apos;s the
              process.
            </h1>
          </ScrollReveal>
        </div>
      </Section>

      <Section className="bg-forest/5">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <ScrollReveal>
            <Eyebrow>Our Philosophy</Eyebrow>
            <p className="mt-4 max-w-lg text-ink/70">
              We believe the most sustainable device is the one that never
              reaches a landfill. Every step of our process, from collection
              to recovery, is designed to keep materials in circulation,
              reduce dependence on raw extraction, and displace the unsafe,
              informal handling that still dominates e-waste management in
              India.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="overflow-hidden rounded-2xl bg-sage/5 ring-1 ring-forest/10">
              <RecycleConverge color="#6B8F71" height={320} />
            </div>
          </ScrollReveal>
        </div>
      </Section>

      <Section>
        <ScrollReveal className="text-center">
          <Eyebrow>Circularity in Action</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Where your materials go
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">
            Not landfilled, but reintroduced. Here&apos;s what happens to the
            materials we recover.
          </p>
        </ScrollReveal>

        <div className="mt-12">
          <MaterialsSection />
        </div>
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal className="text-center">
          <Eyebrow>What Our Recovery Means</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Environmental Equivalencies
          </h2>
        </ScrollReveal>

        <div className="mt-12">
          <EquivalenciesSection />
        </div>
      </Section>

      <Section>
        <ScrollReveal className="text-center">
          <Eyebrow>Climate Commitments</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Contributing to India&apos;s Climate Goals
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <ScrollReveal>
            <Card>
              <h3 className="font-heading text-base font-semibold text-forest">
                India&apos;s 2070 Net Zero Target
              </h3>
              <p className="mt-3 text-[0.87rem] leading-relaxed text-ink/70">
                India committed to achieving net-zero carbon emissions by
                2070, announced at COP26 in 2021. Every tonne of e-waste we
                divert from landfill and informal processing supports this
                national goal by reducing emissions from raw material
                extraction and improper disposal.
              </p>
            </Card>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Card>
              <h3 className="font-heading text-base font-semibold text-forest">
                Carbon Credits Trading
              </h3>
              <p className="mt-3 text-[0.87rem] leading-relaxed text-ink/70">
                India&apos;s Carbon Credit Trading Scheme (CCTS), 2023
                includes a Voluntary Offset Mechanism under which waste
                management projects can register to earn tradable Carbon
                Credit Certificates. We are registered and actively
                participating in this mechanism, formalizing and monetizing
                our emissions-reduction impact.
              </p>
            </Card>
          </ScrollReveal>
        </div>
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal className="text-center">
          <Eyebrow>Global Goals</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Aligned with UN Sustainable Development Goals
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SDGS.map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 0.07}>
              <div
                className="h-full rounded-2xl p-6 text-white transition-transform duration-300 hover:-translate-y-1"
                style={{ background: s.color }}
              >
                <div className="font-heading text-3xl font-bold">{s.n}</div>
                <div className="mt-2 whitespace-pre-line text-sm font-semibold leading-snug">
                  {s.title}
                </div>
                <div className="mt-2 text-[0.76rem] leading-snug opacity-90">
                  {s.desc}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      <Section>
        <ScrollReveal className="text-center">
          <Eyebrow>On The Ground</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Collection Drives &amp; Awareness Campaigns
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {GALLERY.map((item, i) => (
            <ScrollReveal key={item.src} delay={i * 0.1}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-sage/10">
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm text-ink/70">{item.caption}</p>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      <Section className="theme-dark bg-ink text-offwhite">
        <ScrollReveal className="text-center">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            Want to be part of the process?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-offwhite/70">
            Get in touch for a pickup, a quote, or to learn more about our
            approach to sustainable recovery.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-vivid px-8 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Contact Us
          </Link>
        </ScrollReveal>
      </Section>
    </>
  );
}
