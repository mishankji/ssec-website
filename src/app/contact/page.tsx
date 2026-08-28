import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Card } from "@/components/card";

export const metadata: Metadata = {
  title: "Contact & FAQs",
  description: "Get in touch with S S Enviro Care, or find answers to common e-waste recycling questions.",
};

// Placeholder content -- replace with the finished Contact/FAQ design.
const FAQS = [
  {
    q: "What kind of e-waste do you accept?",
    a: "Placeholder answer -- list accepted device categories here.",
  },
  {
    q: "Do you serve individuals or only businesses?",
    a: "Placeholder answer -- clarify collection eligibility here.",
  },
  {
    q: "Is data destruction certified?",
    a: "Placeholder answer -- describe certification and process here.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Section className="pt-32 md:pt-40">
        <ScrollReveal>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-semibold text-forest md:text-5xl">
            Let&apos;s talk e-waste.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">
            Placeholder intro copy. This page will carry the final contact
            form, office details, and FAQ content.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <ScrollReveal>
            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-brass" size={20} />
                <span className="text-sm text-ink/80">E-216 (B), RIA, Sarna Dungar, Jaipur, Rajasthan 302012</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-brass" size={20} />
                <span className="text-sm text-ink/80">+91-96539 63036</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-brass" size={20} />
                <span className="text-sm text-ink/80">info@ssenvirocare.in</span>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <form className="space-y-4 rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
              <div>
                <label className="text-sm font-medium text-ink/80" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="mt-1 w-full rounded-lg border border-forest/15 px-3 py-2 text-sm outline-none focus:border-brass"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink/80" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1 w-full rounded-lg border border-forest/15 px-3 py-2 text-sm outline-none focus:border-brass"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink/80" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-forest/15 px-3 py-2 text-sm outline-none focus:border-brass"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-offwhite transition-colors hover:bg-forest/90"
              >
                Send message
              </button>
              <p className="text-xs text-ink/40">
                Placeholder form -- not yet wired to a submission handler.
              </p>
            </form>
          </ScrollReveal>
        </div>
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal>
          <Eyebrow>FAQs</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Common questions
          </h2>
        </ScrollReveal>

        <div className="mt-10 space-y-4">
          {FAQS.map((item, i) => (
            <ScrollReveal key={item.q} delay={i * 0.08}>
              <Card>
                <h3 className="font-heading text-lg font-semibold text-forest">
                  {item.q}
                </h3>
                <p className="mt-2 text-sm text-ink/70">{item.a}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Section>
    </>
  );
}
