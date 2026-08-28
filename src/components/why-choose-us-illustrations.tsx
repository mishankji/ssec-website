// Custom flat-style SVG illustrations, one per "Why Choose Us" item -- shown
// on the back face of the Services page's flip cards. Each is
// self-contained, sized 120x120, using the brand palette.

const C = {
  primary: "#2F4A3E",
  green: "#3E8E52",
  sage: "#6B8F71",
  brass: "#C9A24B",
};

export function CertifiedIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <path
        d="M60 24 l24 10 v22 c0 20 -12 32 -24 38 c-12 -6 -24 -18 -24 -38 v-22 z"
        fill="none"
        stroke={C.primary}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M48 60 l9 9 l16 -18"
        fill="none"
        stroke={C.brass}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TraceableIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <path
        d="M28 82 q14 -6 20 -20 q6 -14 20 -18 q10 -3 16 -14"
        fill="none"
        stroke={C.sage}
        strokeWidth="3"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      <circle cx="28" cy="82" r="5" fill={C.primary} />
      <path d="M84 22 a10 10 0 1 1 -9 14.3 z" fill={C.brass} />
      <circle cx="84" cy="30" r="3" fill="#fff" />
    </svg>
  );
}

export function SecureIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <rect x="38" y="54" width="44" height="34" rx="5" fill={C.primary} />
      <path
        d="M46 54 v-10 a14 14 0 0 1 28 0 v10"
        fill="none"
        stroke={C.primary}
        strokeWidth="5"
      />
      <circle cx="60" cy="68" r="5" fill={C.brass} />
      <rect x="58" y="70" width="4" height="10" rx="1.5" fill={C.brass} />
    </svg>
  );
}

export function CircularEconomyIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <path
        d="M60 30 a30 30 0 1 1 -21 8.8"
        fill="none"
        stroke={C.primary}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path d="M32 32 l6 8 l-10 2 z" fill={C.primary} />
      <path
        d="M85 60 a25 25 0 0 1 -8 18.5"
        fill="none"
        stroke={C.sage}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path d="M82 84 l-8 -3 l4 -9 z" fill={C.sage} />
      <circle cx="60" cy="60" r="8" fill={C.brass} />
    </svg>
  );
}
