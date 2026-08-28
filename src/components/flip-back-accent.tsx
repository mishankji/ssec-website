/**
 * Simple flip-card back face: a soft blurred color blob positioned
 * off-center on the mint background, with the card's title restated large
 * and bold in the center. Used for the About page's Mission & Vision and
 * Core Values cards, which don't have a bespoke illustration.
 */
export function FlipBackAccent({
  title,
  accent,
}: {
  title: string;
  accent: string;
}) {
  return (
    <>
      <div
        className="pointer-events-none absolute h-40 w-40 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
          top: "-20%",
          right: "-15%",
        }}
      />
      <h3
        className="relative z-10 text-center text-xl font-bold"
        style={{ color: "#2F4A3E" }}
      >
        {title}
      </h3>
    </>
  );
}
