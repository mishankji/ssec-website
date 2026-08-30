import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ClientMarquee } from "@/components/client-marquee";
import { ProcessTimeline } from "@/components/process-timeline";
import { ServicesHeaderBG } from "@/components/services-header-bg";
import { ServiceFlipGrid } from "@/components/service-flip-grid";
import { WhyChooseUsFlipGrid } from "@/components/why-choose-us-flip-grid";
import { ComplianceIllustration } from "@/components/compliance-illustration";

export const metadata: Metadata = {
  title: "Services",
  description: "E-waste collection, data destruction, and recycling services from S S Enviro Care.",
};

const PROCESS_STEPS = [
  {
    title: "Collection",
    description:
      "We collect e-waste directly from your premises via scheduled pickup.",
    animType: "collection",
  },
  {
    title: "Sorting & Grading",
    description:
      "Devices are weighed and segregated to determine reuse, refurbishment, or recycling pathways.",
    animType: "sorting",
  },
  {
    title: "Dismantling",
    description:
      "Equipment is carefully disassembled into material streams: metals, plastics, glass, and circuit boards.",
    animType: "dismantling",
  },
  {
    title: "Recovery & Recycling",
    description:
      "Valuable materials are recovered and channeled back into the manufacturing supply chain.",
    animType: "recovery",
  },
  {
    title: "Certification",
    description:
      "Clients receive documentation and certificates of recycling/destruction for compliance records.",
    animType: "certification",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <Section className="relative overflow-hidden pt-32 md:pt-40">
        <ServicesHeaderBG />
        <div className="relative z-10">
          <ScrollReveal>
            <Eyebrow>Services</Eyebrow>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold text-forest md:text-5xl">
              Our Services
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink/70">
              End-to-end e-waste management, from doorstep collection to
              certified material recovery.
            </p>
          </ScrollReveal>
        </div>
      </Section>

      <Section>
        <ScrollReveal>
          <Eyebrow>What We Offer</Eyebrow>
        </ScrollReveal>

        <ServiceFlipGrid />
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal>
          <Eyebrow>How It Works</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Our Process
          </h2>
        </ScrollReveal>

        <ProcessTimeline steps={PROCESS_STEPS} />
      </Section>

      <Section>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <ScrollReveal>
            <Eyebrow>Compliance & Reporting</Eyebrow>
            <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
              Compliance, Handled
            </h2>
            <p className="mt-4 max-w-lg text-ink/70">
              We handle the paperwork so you don&apos;t have to. Every
              collection is documented, and clients receive certificates of
              recycling and EPR compliance reports for their records.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="flex items-center justify-center overflow-hidden rounded-2xl bg-sage/5 py-10 ring-1 ring-forest/10">
              <ComplianceIllustration />
            </div>
          </ScrollReveal>
        </div>
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal>
          <Eyebrow>Why Choose Us</Eyebrow>
        </ScrollReveal>

        <WhyChooseUsFlipGrid />
      </Section>

      <Section className="theme-dark bg-ink text-offwhite">
        <ScrollReveal className="text-center">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-offwhite/70">
            Contact us to schedule your first collection or discuss EPR
            compliance.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-vivid px-8 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Contact Us
          </Link>
        </ScrollReveal>
      </Section>

      <Section className="py-14 md:py-20">
        <ScrollReveal className="text-center">
          <Eyebrow>Trusted By</Eyebrow>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-forest md:text-3xl">
            Businesses and institutions across India trust us with
            their e-waste.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="mt-10">
          <ClientMarquee />
        </ScrollReveal>
      </Section>
    </>
  );
}
