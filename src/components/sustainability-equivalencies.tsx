"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function useInView(threshold = 0.4) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

function useCountUp(target: number, duration: number, start: boolean) {
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!start) return;
    let t0: number | null = null;
    let raf: number;
    const step = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return v;
}

function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: ReactNode;
}) {
  const [ref, inView] = useInView(0.4);
  const count = useCountUp(value, 1800, inView);

  return (
    <div ref={ref} className="text-center">
      <div className="font-heading text-[clamp(2rem,3.6vw,2.8rem)] font-bold leading-none text-forest">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-2 text-[0.82rem] uppercase tracking-wide text-ink/60">
        {label}
      </div>
    </div>
  );
}

export function EquivalenciesSection() {
  return (
    <>
      <div className="grid items-start gap-8 sm:grid-cols-3">
        <Stat value={6600} suffix="+" label="Tonnes Processed / Year" />
        <Stat value={18700} suffix="" label="Metric Tons CO2e Avoided / Year" />
        <Stat
          value={4060}
          suffix=""
          label={
            <>
              Passenger Vehicles&rsquo; Annual
              <br />
              Emissions, Avoided
            </>
          }
        />
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-[0.78rem] italic leading-relaxed text-ink/50">
        Illustrative estimate based on U.S. EPA WARM model recycling-vs-landfill
        emission factors (2.83 metric tons CO2e avoided per tonne recycled) and
        EPA average passenger vehicle emissions (4.6 metric tons CO2e/vehicle/
        year). Not an audited or third-party-verified figure.
      </p>
    </>
  );
}
