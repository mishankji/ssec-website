import Link from "next/link";
import { Recycle, ShieldCheck, Leaf, Factory } from "lucide-react";
import { Hero } from "@/components/hero";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CountUpStat } from "@/components/count-up-stat";
import { Card } from "@/components/card";

// Placeholder content -- replace with the finished Home page design.
const SERVICES_PREVIEW = [
  {
    icon: Recycle,
    title: "E-Waste Collection",
    description:
      "Scheduled pickups for businesses and institutions across Jaipur and Rajasthan.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Data Destruction",
    description:
      "Certified, auditable destruction of data-bearing devices before recycling.",
  },
  {
    icon: Factory,
    title: "Responsible Recycling",
    description:
      "Material recovery through certified, environmentally sound processing.",
  },
];

export default function Home() {
  return (
    <>
      <Hero
        quote="Turning yesterday's electronics into tomorrow's resources."
        attribution="S S Enviro Care — Jaipur"
      />

      {/* Stats band continues the dark theme just below the hero */}
      <section className="theme-dark bg-ink px-6 py-16 text-offwhite">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          <CountUpStat value={10000} suffix="+" label="kg e-waste recycled" />
          <CountUpStat value={500} suffix="+" label="businesses served" />
          <CountUpStat value={15} suffix="+" label="years of experience" />
          <CountUpStat value={100} suffix="%" label="certified disposal" />
        </div>
      </section>

      <Section>
        <ScrollReveal>
          <Eyebrow>What we do</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            End-to-end e-waste management, built for accountability.
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SERVICES_PREVIEW.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 0.1}>
              <Card>
                <service.icon className="text-brass" size={28} />
                <h3 className="font-heading mt-4 text-xl font-semibold text-forest">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70">
                  {service.description}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <Link
            href="/services"
            className="mt-10 inline-block text-sm font-semibold text-forest underline decoration-brass decoration-2 underline-offset-4 transition-colors hover:text-brass"
          >
            View all services →
          </Link>
        </ScrollReveal>
      </Section>

      <Section className="bg-forest/5">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <ScrollReveal>
            <Leaf className="text-sage" size={32} />
            <h2 className="font-heading mt-4 text-3xl font-semibold text-forest md:text-4xl">
              Sustainability isn&apos;t an afterthought. It&apos;s the process.
            </h2>
            <p className="mt-4 max-w-lg text-ink/70">
              From collection to certified disposal, every step is designed
              to keep hazardous material out of landfills and recoverable
              resources back in circulation.
            </p>
            <Link
              href="/sustainability"
              className="mt-6 inline-block text-sm font-semibold text-forest underline decoration-brass decoration-2 underline-offset-4 transition-colors hover:text-brass"
            >
              Our sustainability approach →
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="aspect-video rounded-2xl bg-sage/20" />
          </ScrollReveal>
        </div>
      </Section>

      <Section className="theme-dark bg-ink text-offwhite">
        <ScrollReveal className="text-center">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            Ready to recycle responsibly?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-offwhite/70">
            Get in touch for a pickup, a quote, or to ask about our
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
