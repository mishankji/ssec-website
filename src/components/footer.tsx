import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-forest text-offwhite">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-semibold">S S Enviro Care</p>
          <p className="mt-3 max-w-xs text-sm text-offwhite/75">
            Committed to responsible e-waste recycling and sustainable
            environmental solutions. Making our planet cleaner, one device
            at a time.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brass">
            Site
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-offwhite/80 transition-colors hover:text-brass"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brass">
            Contact
          </p>
          <ul className="mt-4 space-y-3 text-sm text-offwhite/80">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-sage" />
              <span>E-216 (B), RIA, Sarna Dungar, Jaipur, Rajasthan 302012</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-sage" />
              <span>+91-96539 63036</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-sage" />
              <span>info@ssenvirocare.in</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-offwhite/10 px-6 py-5 text-center text-xs text-offwhite/60">
        © {new Date().getFullYear()} S S Enviro Care. All rights reserved.
      </div>
    </footer>
  );
}
