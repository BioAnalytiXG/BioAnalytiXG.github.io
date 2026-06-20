/**
 * Coverage hero illustration — a browser window showing an article, with a
 * floating quote bubble, a document card, and dotted accent arcs. Mint palette
 * only (white + #DAF7EC / #A6E1CD / #7CCDB3 / #1D6D55).
 */
const MINT = "#7CCDB3";
const TINT = "#DAF7EC";
const MID = "#A6E1CD";
const INK = "#1D6D55";

export function CoverageHeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 700 520"
      className={className}
      role="img"
      aria-label="A browser window showing a BioAnalytiX article with a quote and a chart"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cov-win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3fbf8" />
        </linearGradient>
        <radialGradient id="cov-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={MINT} stopOpacity="0.4" />
          <stop offset="100%" stopColor={MINT} stopOpacity="0" />
        </radialGradient>
        <filter id="cov-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor={MINT} floodOpacity="0.16" />
        </filter>
        <filter id="cov-shadow-sm" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="11" floodColor={MINT} floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Dotted accent arcs */}
      <path d="M70 320 Q40 200 175 150" fill="none" stroke={MINT} strokeWidth="2.2" strokeDasharray="0.5 11" strokeLinecap="round" opacity="0.6" />
      <path d="M560 430 Q675 380 648 255" fill="none" stroke={MINT} strokeWidth="2.2" strokeDasharray="0.5 11" strokeLinecap="round" opacity="0.6" />

      {/* Browser window */}
      <g filter="url(#cov-shadow)">
        <rect x="120" y="92" width="424" height="300" rx="18" fill="url(#cov-win)" stroke={MINT} strokeWidth="1.8" strokeOpacity="0.5" />
        {/* header */}
        <line x1="120" y1="130" x2="544" y2="130" stroke={TINT} strokeWidth="1.6" />
        <circle cx="144" cy="111" r="4" fill={MINT} />
        <circle cx="160" cy="111" r="4" fill={MID} />
        <circle cx="176" cy="111" r="4" fill={TINT} />
        <rect x="250" y="104" width="180" height="14" rx="7" fill={TINT} />

        {/* chart chip */}
        <rect x="150" y="156" width="96" height="78" rx="12" fill="#ffffff" stroke={MINT} strokeWidth="1.4" strokeOpacity="0.45" />
        <rect x="166" y="200" width="9" height="18" rx="2.5" fill={MID} />
        <rect x="182" y="190" width="9" height="28" rx="2.5" fill={MINT} />
        <rect x="198" y="196" width="9" height="22" rx="2.5" fill={MID} />
        <rect x="214" y="180" width="9" height="38" rx="2.5" fill={INK} />

        {/* image placeholder */}
        <rect x="270" y="156" width="234" height="120" rx="12" fill={TINT} />
        <circle cx="296" cy="182" r="11" fill={MINT} />
        <polygon points="288,266 326,210 364,266" fill={MINT} opacity="0.5" />
        <polygon points="346,266 382,224 418,266" fill={INK} opacity="0.45" />

        {/* text lines */}
        <rect x="150" y="300" width="354" height="9" rx="4.5" fill={MID} />
        <rect x="150" y="320" width="300" height="9" rx="4.5" fill={TINT} />
        <rect x="150" y="340" width="330" height="9" rx="4.5" fill={TINT} />
      </g>

      {/* Quote bubble (top-right) */}
      <g filter="url(#cov-shadow-sm)">
        <path
          d="M552 116 h74 a20 20 0 0 1 20 20 v50 a20 20 0 0 1 -20 20 h-30 l-16 20 v-20 h-28 a20 20 0 0 1 -20 -20 v-50 a20 20 0 0 1 20 -20 z"
          fill="#ffffff" stroke={MINT} strokeWidth="1.6" strokeOpacity="0.5"
        />
        {/* quotation marks */}
        <path d="M566 150 q-10 4 -10 18 h12 v-12 h-6 q0 -4 6 -6 z" fill={MINT} />
        <path d="M592 150 q-10 4 -10 18 h12 v-12 h-6 q0 -4 6 -6 z" fill={INK} />
      </g>

      {/* Document card (bottom-right) */}
      <g filter="url(#cov-shadow-sm)">
        <rect x="520" y="318" width="112" height="138" rx="12" fill="#ffffff" stroke={MINT} strokeWidth="1.6" strokeOpacity="0.5" />
        {/* folded corner */}
        <path d="M612 318 l20 20 h-20 z" fill={TINT} />
        <rect x="538" y="352" width="62" height="8" rx="4" fill={MINT} opacity="0.7" />
        <rect x="538" y="370" width="76" height="7" rx="3.5" fill={MID} />
        <rect x="538" y="386" width="76" height="7" rx="3.5" fill={TINT} />
        <rect x="538" y="402" width="56" height="7" rx="3.5" fill={TINT} />
      </g>

      {/* Accent nodes on the arcs */}
      <g>
        <circle cx="175" cy="150" r="12" fill="url(#cov-node)" />
        <circle cx="175" cy="150" r="4" fill="#ffffff" stroke={MINT} strokeWidth="2" />
        <circle cx="175" cy="150" r="1.8" fill={INK} />
        <circle cx="648" cy="255" r="14" fill="url(#cov-node)" />
        <circle cx="648" cy="255" r="5" fill="#ffffff" stroke={MINT} strokeWidth="2" />
        <circle cx="648" cy="255" r="2.2" fill={INK} />
        <circle cx="70" cy="320" r="10" fill="url(#cov-node)" />
        <circle cx="70" cy="320" r="3.5" fill="#ffffff" stroke={MINT} strokeWidth="1.5" />
        <circle cx="70" cy="320" r="1.6" fill={INK} />
      </g>
    </svg>
  );
}

export default CoverageHeroIllustration;
