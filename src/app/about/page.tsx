import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AboutHeaderBG } from "@/components/about-header-bg";
import { MissionVisionFlipGrid } from "@/components/mission-vision-flip-grid";
import { CertificationsFlipGrid } from "@/components/certifications-flip-grid";
import { CoreValuesFlipGrid } from "@/components/core-values-flip-grid";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about S S Enviro Care's mission, values, and approach to certified e-waste recycling in Jaipur.",
};

export default function AboutPage() {
  return (
    <>
      <Section className="relative overflow-hidden pt-32 md:pt-40">
        <AboutHeaderBG />
        <div className="relative z-10">
          <ScrollReveal>
            <Eyebrow>About S S Enviro Care</Eyebrow>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold text-forest md:text-5xl">
              A young company, built on certified, accountable e-waste
              recycling.
            </h1>
          </ScrollReveal>
        </div>
      </Section>

      <Section>
        <ScrollReveal>
          <Eyebrow>Why We Exist</Eyebrow>
          <p className="mt-4 max-w-2xl text-ink/70">
            India generates over 1.8 million tonnes of e-waste every year,
            and an estimated 90% of it is still handled by the informal
            sector, often without basic safety measures or environmental
            safeguards.
          </p>
          <p className="mt-4 max-w-2xl text-ink/70">
            SS Envirocare was founded because we saw this gap up close:
            valuable resources being lost, and people handling hazardous
            material without protection. We started in Jaipur with a simple
            aim: build a recycling operation that does this properly,
            certified, safe, and accountable at every step.
          </p>
        </ScrollReveal>
      </Section>

      <Section className="bg-forest/5">
        <MissionVisionFlipGrid />
      </Section>

      <Section>
        <ScrollReveal>
          <Eyebrow>Licenses and Certifications</Eyebrow>
        </ScrollReveal>

        <CertificationsFlipGrid />
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal>
          <Eyebrow>What Drives Us</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Our Core Values
          </h2>
        </ScrollReveal>

        <CoreValuesFlipGrid />
      </Section>

      <Section className="theme-dark bg-ink text-offwhite">
        <ScrollReveal className="text-center">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            Ready to work with a certified recycling partner?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-offwhite/70">
            Get in touch for a pickup, a quote, or to learn more about our
            certifications.
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
