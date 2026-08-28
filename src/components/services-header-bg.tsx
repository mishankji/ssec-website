"use client";

import { useEffect, useRef } from "react";

type Chip = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  opacity: number;
  color: string;
};

/**
 * Faint drifting background for the Services page header -- same family as
 * the About page's AboutHeaderBG, but using small rotating rectangular
 * "chip" fragments instead of soft circles, to subtly nod at recovered
 * material/circuit boards. Same quiet opacity range, slow motion,
 * non-distracting. Brass-forward weighting this time (vs. green-forward on
 * About) so the two pages feel related but distinct.
 */
export function ServicesHeaderBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number;
    let h: number;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#C9A24B", "#2F4A3E", "#6B8F71"];
    const particles: Chip[] = Array.from({ length: 16 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 10 + Math.random() * 16,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.07,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.004,
      opacity: 0.05 + Math.random() * 0.06,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30;
        if (p.y > h + 30) p.y = -30;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        // rounded rect "chip" shape
        const s = p.size;
        const r = 3;
        ctx.beginPath();
        ctx.moveTo(-s / 2 + r, -s / 3);
        ctx.arcTo(s / 2, -s / 3, s / 2, s / 3, r);
        ctx.arcTo(s / 2, s / 3, -s / 2, s / 3, r);
        ctx.arcTo(-s / 2, s / 3, -s / 2, -s / 3, r);
        ctx.arcTo(-s / 2, -s / 3, s / 2, -s / 3, r);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
