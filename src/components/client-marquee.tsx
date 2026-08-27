import Image from "next/image";

// Client logos placed in public/clients/. Two of these (AVVNL, JVVNL) are
// best-effort labels -- confirm the exact names if they matter for alt text.
const CLIENTS = [
  { name: "CP Plus", src: "/clients/cp-plus.png" },
  { name: "Kent", src: "/clients/kent.png" },
  { name: "DCM Shriram", src: "/clients/dcm-shriram.png" },
  { name: "Jaipur Metro", src: "/clients/jaipur-metro.png" },
  { name: "Ensol", src: "/clients/ensol.png" },
  { name: "Maxop", src: "/clients/maxop.png" },
  { name: "Bharti Real Estate", src: "/clients/bharti-real-estate.png" },
  { name: "AVVNL", src: "/clients/client-avvnl.png" },
  { name: "JVVNL", src: "/clients/client-arch-mark.png" },
  { name: "BSNL", src: "/clients/bsnl.png" },
  { name: "Vi", src: "/clients/vi.png" },
  { name: "NAV", src: "/clients/nav.png" },
  { name: "Havells", src: "/clients/havells.png" },
  { name: "Prostarm", src: "/clients/prostarm.png" },
];

export function ClientMarquee() {
  // Duplicated so the track can loop seamlessly at a -50% translate.
  const track = [...CLIENTS, ...CLIENTS];

  return (
    <div className="group relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-24" />

      <div className="marquee-track flex w-max items-center gap-8 py-2 group-hover:[animation-play-state:paused] md:gap-12">
        {track.map((client, i) => (
          <div
            key={`${client.name}-${i}`}
            className="flex h-16 w-32 shrink-0 items-center justify-center rounded-xl bg-white p-4 shadow-sm md:h-20 md:w-40"
          >
            <div className="relative h-full w-full">
              <Image
                src={client.src}
                alt={client.name}
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
