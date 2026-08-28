import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Target, Eye, Leaf, ShieldCheck, Lightbulb, HeartHandshake } from "lucide-react";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Card } from "@/components/card";
import { AboutHeaderBG } from "@/components/about-header-bg";
import { PhotoSlideshow } from "@/components/photo-slideshow";

const WHY_WE_EXIST_IMAGES = [
  "/hero/hero-team-sorting.jpg",
  "/hero/hero-ac-units.jpg",
  "/hero/hero-collection-drive.jpg",
];

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about S S Enviro Care's mission, values, and approach to certified e-waste recycling in Jaipur.",
};

const MISSION_VISION = [
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
];

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

const CORE_VALUES = [
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Environmentally responsible practices in everything we do.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity",
    description: "Transparency, honesty, and the highest ethical standards.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "Continuously improving processes to maximize resource recovery.",
  },
  {
    icon: HeartHandshake,
    title: "Collaboration",
    description:
      "Working with clients, regulators, and communities toward shared goals.",
  },
];

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

const GOV_SCHEMES = [
  {
    title: "E-Waste (Management) Rules, 2022",
    description:
      "Our collection, dismantling, and EPR processes operate within this regulatory framework, which governs how e-waste must be handled across India.",
  },
  {
    title: "Swachh Bharat Mission",
    description:
      "Our collection drives and awareness campaigns contribute to India's national cleanliness and waste management goals at the community level.",
  },
];

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
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <ScrollReveal>
            <Eyebrow>Why We Exist</Eyebrow>
            <p className="mt-4 max-w-2xl text-ink/70">
              India generates over 1.8 million tonnes of e-waste every year —
              and an estimated 90% of it is still handled by the informal
              sector, often without basic safety measures or environmental
              safeguards.
            </p>
            <p className="mt-4 max-w-2xl text-ink/70">
              SS Envirocare was founded because we saw this gap up close:
              valuable resources being lost, and people handling hazardous
              material without protection. We started in Jaipur with a
              simple aim — build a recycling operation that does this
              properly: certified, safe, and accountable at every step.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <PhotoSlideshow
              images={WHY_WE_EXIST_IMAGES}
              className="aspect-[4/3]"
            />
          </ScrollReveal>
        </div>
      </Section>

      <Section className="bg-forest/5">
        <div className="grid gap-6 md:grid-cols-2">
          {MISSION_VISION.map((item, i) => (
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
          <Eyebrow>Licenses and Certifications</Eyebrow>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CERTIFICATIONS.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <Card>
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
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal>
          <Eyebrow>What Drives Us</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Our Core Values
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_VALUES.map((item, i) => (
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

        <ScrollReveal delay={0.1} className="mt-12">
          <h3 className="font-heading text-lg font-semibold text-forest">
            UN Sustainable Development Goals
          </h3>
        </ScrollReveal>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {SDGS.map((item, i) => (
            <ScrollReveal key={item.number} delay={0.1 + i * 0.1}>
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

        <ScrollReveal delay={0.1} className="mt-14">
          <h3 className="font-heading text-lg font-semibold text-forest">
            Government Scheme Alignment
          </h3>
        </ScrollReveal>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {GOV_SCHEMES.map((item, i) => (
            <ScrollReveal key={item.title} delay={0.1 + i * 0.1}>
              <Card>
                <h4 className="font-heading text-lg font-semibold text-forest">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-ink/70">{item.description}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
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
