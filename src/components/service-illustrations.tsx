// Custom flat-style SVG illustrations, one per service -- shown on the back
// face of the Services page's flip cards. Each is self-contained, sized
// 120x120, using the brand palette.

const C = {
  primary: "#2F4A3E",
  green: "#3E8E52",
  sage: "#6B8F71",
  brass: "#C9A24B",
  ink: "#1B2420",
};

export function CollectionIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <rect x="24" y="58" width="46" height="26" rx="4" fill={C.primary} />
      <path d="M70 66 h18 l10 12 v6 h-28 z" fill={C.sage} />
      <circle cx="40" cy="88" r="8" fill={C.ink} />
      <circle cx="40" cy="88" r="3.5" fill="#fff" />
      <circle cx="82" cy="88" r="8" fill={C.ink} />
      <circle cx="82" cy="88" r="3.5" fill="#fff" />
      <rect x="30" y="64" width="14" height="10" rx="1.5" fill={C.brass} />
    </svg>
  );
}

export function DataDestructionIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <rect x="38" y="34" width="44" height="52" rx="4" fill={C.primary} />
      <circle cx="60" cy="52" r="9" fill="#fff" />
      <rect x="55" y="58" width="10" height="12" rx="2" fill="#fff" />
      <path
        d="M60 30 a10 10 0 0 1 10 10 v6 h-6 v-6 a4 4 0 0 0 -8 0 v6 h-6 v-6 a10 10 0 0 1 10 -10 z"
        fill={C.brass}
      />
      <line
        x1="46"
        y1="90"
        x2="74"
        y2="90"
        stroke={C.sage}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DismantlingIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <rect x="32" y="40" width="56" height="36" rx="3" fill={C.primary} />
      <rect x="38" y="46" width="44" height="24" rx="2" fill={C.sage} />
      <rect x="40" y="76" width="40" height="6" rx="2" fill={C.ink} />
      <g transform="rotate(35 82 40)">
        <rect x="78" y="18" width="8" height="30" rx="2" fill={C.brass} />
        <rect x="74" y="14" width="16" height="10" rx="2" fill={C.brass} />
      </g>
    </svg>
  );
}

export function MetalScrapIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <rect x="34" y="68" width="52" height="10" rx="2" fill={C.sage} />
      <rect x="38" y="56" width="44" height="10" rx="2" fill={C.brass} />
      <rect x="42" y="44" width="36" height="10" rx="2" fill={C.primary} />
      <path
        d="M60 20 a18 18 0 1 1 -12.7 5.3 l4 4 a12 12 0 1 0 8.7 -3.6 z"
        fill={C.ink}
        opacity="0.85"
      />
    </svg>
  );
}

export function EPRIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <rect
        x="36"
        y="26"
        width="48"
        height="64"
        rx="4"
        fill="#fff"
        stroke={C.primary}
        strokeWidth="3"
      />
      <line x1="44" y1="42" x2="76" y2="42" stroke={C.sage} strokeWidth="3" />
      <line x1="44" y1="52" x2="76" y2="52" stroke={C.sage} strokeWidth="3" />
      <line x1="44" y1="62" x2="64" y2="62" stroke={C.sage} strokeWidth="3" />
      <circle cx="82" cy="80" r="16" fill={C.brass} />
      <path
        d="M75 80 l5 5 l10 -11"
        stroke="#fff"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BuybackIllustration() {
  return (
    <svg viewBox="0 0 120 120" width="96" height="96">
      <circle cx="60" cy="60" r="52" fill={`${C.green}1a`} />
      <path
        d="M28 62 q10 -14 28 -2 q6 4 12 0 q18 -12 28 2 l-6 8 q-16 -12 -22 0 q-8 10 -18 2 q-12 -8 -16 0 z"
        fill={C.primary}
      />
      <circle cx="60" cy="42" r="14" fill={C.brass} />
      <text
        x="60"
        y="47"
        fontSize="14"
        fontWeight="700"
        fill="#fff"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        ₹
      </text>
    </svg>
  );
}
