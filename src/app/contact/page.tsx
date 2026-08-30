import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Section, Eyebrow } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ContactForm } from "@/components/contact-form";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "Contact & FAQs",
  description:
    "Get in touch with S S Enviro Care, or find answers to common e-waste recycling questions.",
};

const FAQS = [
  {
    q: "What types of e-waste do you accept?",
    a: "We accept all types of electronic waste including computers, laptops, servers, mobile phones, tablets, printers, copiers, televisions, refrigerators, air conditioners, washing machines, and other electronic appliances.",
  },
  {
    q: "How can I schedule an e-waste pickup?",
    a: "You can schedule a pickup by calling us or sending us an email using the form above. We'll arrange a convenient time for collection.",
  },
  {
    q: "Is my data safe when I dispose of my electronic devices?",
    a: "Absolutely. Our certified data destruction services ensure complete wiping or physical destruction of storage media following international standards. We provide a Certificate of Data Destruction upon completion.",
  },
  {
    q: "Do you provide certificates for recycled e-waste?",
    a: "Yes, we provide official Certificates of Recycling/Disposal for all e-waste processed through our facility, including details such as the type and quantity of waste, date of collection, and recycling method. These are usable for compliance and sustainability reporting.",
  },
  {
    q: "What happens to the e-waste after collection?",
    a: "After collection, e-waste is transported to our CPCB-authorized facility, where it undergoes registration and weighing, sorting by category, testing for potential reuse, dismantling, segregation of components, resource recovery, and responsible disposal of non-recyclable materials.",
  },
  {
    q: "Are there any charges for e-waste collection?",
    a: "Pricing varies based on the type and quantity of e-waste, as well as your location. For certain high-value items, we may offer buyback options. Contact our team for a customized quote. Large corporate clients can access special contract rates.",
  },
  {
    q: "How can my company benefit from your buyback program?",
    a: "Our buyback program offers fair market value for functional/non-functional electronic equipment, providing financial returns on unused assets, reducing storage costs, ensuring proper disposal, and contributing to your sustainability goals. All equipment undergoes secure data wiping before evaluation.",
  },
  {
    q: "What are your certifications and authorizations?",
    a: "SS Envirocare is fully authorized by the Central Pollution Control Board (CPCB) and State Pollution Control Board (SPCB) for e-waste recycling.",
  },
  {
    q: "Do you conduct awareness programs on e-waste management?",
    a: "Yes, we offer customized awareness programs for corporations, educational institutions, and communities on responsible e-waste management, including presentations, workshops, and educational materials.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Section className="pb-10 pt-32 text-center md:pt-40">
        <ScrollReveal>
          <Eyebrow>Get In Touch</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-semibold text-forest md:text-5xl">
            Ready to responsibly recycle your e-waste?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">
            Our team is just a call away to help with pickup services,
            recycling information, or any questions you have.
          </p>
        </ScrollReveal>
      </Section>

      <Section className="pt-0 md:pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4 rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-forest/10">
                  <MapPin size={19} className="text-forest" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-sage">
                    Visit Us
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-ink">
                    SS Envirocare, E216 (B), RIA - Sarna Dungar, Jaipur,
                    Rajasthan - 302012
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-forest/10">
                  <Phone size={19} className="text-forest" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-sage">
                    Call Us
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-ink">
                    +91 96544 63036
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
                    <Clock size={13} />
                    Monday to Friday, 9:00 AM - 6:00 PM
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-forest/10 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-forest/10">
                  <Mail size={19} className="text-forest" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-sage">
                    Email Us
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-ink">
                    info@ssenvirocare.in
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <ContactForm />
          </ScrollReveal>
        </div>
      </Section>

      <Section className="bg-forest/5">
        <ScrollReveal className="text-center">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold text-forest md:text-4xl">
            Frequently Asked Questions
          </h2>
        </ScrollReveal>

        <div className="mx-auto mt-10 max-w-3xl">
          <FaqAccordion items={FAQS} />
        </div>
      </Section>
    </>
  );
}
