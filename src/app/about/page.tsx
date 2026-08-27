import type { Metadata } from "next";
import { Target, Eye, HeartHandshake } from "lucide-react";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Card } from "@/components/card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about S S Enviro Care's mission, values, and approach to certified e-waste recycling in Jaipur.",
};

// Placeholder content -- replace with the finished About page design.
const VALUES = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make responsible e-waste disposal accessible and accountable for every business and household in Rajasthan.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "A future where no electronic device ends up in a landfill or an informal, unsafe recycling chain.",
  },
  {
    icon: HeartHandshake,
    title: "Our Values",
    description:
      "Transparency, compliance, and environmental stewardship guide every pickup and every process.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pt-32 md:pt-40">
        <ScrollReveal>
          <Eyebrow>About S S Enviro Care</Eyebrow>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold text-forest md:text-5xl">
            Built in Jaipur, focused on cleaner electronics
            lifecycle for everyone.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">
            Placeholder introduction -- replace with the finished About
            page copy. This section will carry the company story: how
            S S Enviro Care started, what problem it set out to solve,
            and why e-waste management matters in Rajasthan today.
          </p>
        </ScrollReveal>
      </Section>

      <Section className="bg-forest/5">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <Card>
                <item.icon className="text-brass" size={28} />
                <h3 className="font-heading mt-4 text-xl font-semibold text-forest">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70">{item.description}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      <Section>
        <ScrollReveal>
          <Eyebrow>Our Story</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Placeholder section for the full company story.
          </h2>
          <p className="mt-4 max-w-2xl text-ink/70">
            Drop in the finished narrative, timeline, certifications, or
            leadership profiles here once the design is ready to paste in.
          </p>
        </ScrollReveal>
      </Section>
    </>
  );
}
