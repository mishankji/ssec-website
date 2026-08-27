import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ClientMarquee } from "@/components/client-marquee";

export const metadata: Metadata = {
  title: "Services",
  description: "E-waste collection, data destruction, and recycling services from S S Enviro Care.",
};

export default function ServicesPage() {
  return (
    <>
      <Section className="pt-32 md:pt-40">
        <ScrollReveal>
          <Eyebrow>Services</Eyebrow>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold text-forest md:text-5xl">
            Services page -- content coming soon.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">
            This page is scaffolded with the site&apos;s design system and
            ready for the finished Services content and layout.
          </p>
        </ScrollReveal>
      </Section>

      <Section className="bg-forest/5 py-14 md:py-20">
        <ScrollReveal className="text-center">
          <Eyebrow>Trusted By</Eyebrow>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-forest md:text-3xl">
            Businesses and institutions across Rajasthan trust us with
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
