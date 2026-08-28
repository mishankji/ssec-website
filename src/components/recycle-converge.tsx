"use client";

import { useEffect, useRef, useState } from "react";

function useInView(threshold = 0.25) {
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

/**
 * Canvas particle animation: dots drift in and converge into a dotted
 * three-arrow recycle symbol once the component scrolls into view.
 */
export function RecycleConverge({
  color = "#5FD97A",
  height = 240,
}: {
  color?: string;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wrapRef, inView] = useInView(0.3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = (canvas.width = canvas.offsetWidth);
    const h = (canvas.height = canvas.offsetHeight);
    const cx = w / 2;
    const cy = h / 2;

    const targets: { x: number; y: number }[] = [];
    const R = Math.min(w, h) * 0.32;
    const arcSpan = (78 * Math.PI) / 180;
    const gap = (42 * Math.PI) / 180;
    const shaftPoints = 16;

    for (let arm = 0; arm < 3; arm++) {
      const startAngle = arm * (arcSpan + gap) - Math.PI / 2;
      const endAngle = startAngle + arcSpan;

      for (let i = 0; i < shaftPoints; i++) {
        const t = startAngle + (i / (shaftPoints - 1)) * arcSpan;
        targets.push({ x: cx + Math.cos(t) * R, y: cy + Math.sin(t) * R });
      }

      const tipAngle = endAngle + 0.16;
      const tipX = cx + Math.cos(tipAngle) * R;
      const tipY = cy + Math.sin(tipAngle) * R;
      const backAngle = endAngle - 0.14;
      const outX = cx + Math.cos(backAngle) * (R + 16);
      const outY = cy + Math.sin(backAngle) * (R + 16);
      const inX = cx + Math.cos(backAngle) * (R - 16);
      const inY = cy + Math.sin(backAngle) * (R - 16);
      const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

      for (let i = 0; i <= 4; i++) {
        const f = i / 4;
        targets.push({ x: lerp(outX, tipX, f), y: lerp(outY, tipY, f) });
        targets.push({ x: lerp(inX, tipX, f), y: lerp(inY, tipY, f) });
        targets.push({ x: lerp(outX, inX, f), y: lerp(outY, inY, f) });
      }
    }

    const particles = targets.map((t) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      tx: t.x,
      ty: t.y,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        if (!inView) return;
        p.x += (p.tx - p.x) * 0.045;
        p.y += (p.ty - p.y) * 0.045;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [inView, color]);

  return (
    <div ref={wrapRef}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: `${height}px`, display: "block" }}
      />
    </div>
  );
}
