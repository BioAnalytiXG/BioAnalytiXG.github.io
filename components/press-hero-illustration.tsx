/**
 * Press hero illustration.
 *
 * A hand-authored isometric recreation of the reference artwork: a stacked
 * portrait document tilted in isometric perspective (apex at top-left, top edge
 * sloping down to the right), with content (divider, image placeholder, text
 * lines) laid flat on the skewed page face, two upright floating speech bubbles
 * (chat dots + bar chart), and a tilted dotted orbit ring with glowing nodes.
 *
 * Palette is strictly white + #7CCDB3 (mint accent) + #DAF7EC (soft mint tint);
 * depth/shadow is expressed with low-opacity #7CCDB3 only.
 */

type Pt = [number, number];

/* Isometric basis for the front page. P(u,v) maps page-local coords
   (u: 0→1 left→right, v: 0→1 top→bottom) onto the tilted screen face. */
const TL: Pt = [500, 100];
const W: Pt = [312, 116]; // width axis → right & slightly down
const H: Pt = [-210, 360]; // height axis → down & left

const P = (u: number, v: number): Pt => [
  TL[0] + W[0] * u + H[0] * v,
  TL[1] + W[1] * u + H[1] * v,
];

const f = (n: number) => Number(n.toFixed(1));

/** Unit vector from `from` toward `to`. */
function unit(to: Pt, from: Pt): Pt {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

/** Build a closed path with rounded corners through the given polygon points. */
function roundedPath(pts: Pt[], r: number): string {
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const tp = unit(prev, cur);
    const tn = unit(next, cur);
    const a: Pt = [cur[0] + tp[0] * r, cur[1] + tp[1] * r];
    const b: Pt = [cur[0] + tn[0] * r, cur[1] + tn[1] * r];
    d +=
      (i === 0 ? `M ${f(a[0])} ${f(a[1])} ` : `L ${f(a[0])} ${f(a[1])} `) +
      `Q ${f(cur[0])} ${f(cur[1])} ${f(b[0])} ${f(b[1])} `;
  }
  return d + "Z";
}

const poly = (...pts: Pt[]) => pts.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");

/** A flat text-line bar on the page face, from u0→u1 at height v, thickness t. */
const bar = (u0: number, u1: number, v: number, t: number) =>
  poly(P(u0, v), P(u1, v), P(u1, v + t), P(u0, v + t));

const offset = (pts: Pt[], dx: number, dy: number): Pt[] =>
  pts.map(([x, y]) => [x + dx, y + dy]);

/* Front page corners: TL, TR, BR, BL. */
const PAGE: Pt[] = [
  TL,
  [TL[0] + W[0], TL[1] + W[1]],
  [TL[0] + W[0] + H[0], TL[1] + W[1] + H[1]],
  [TL[0] + H[0], TL[1] + H[1]],
];

const MINT = "#7CCDB3"; // primary accent
const TINT = "#DAF7EC"; // softest fill
const MID = "#A6E1CD"; // mid mint — visible lines/fills on white
const INK = "#1D6D55"; // deep brand green (--brand-ink) for contrast accents

/* Orbit path (axis-aligned ellipse); tilted via a parent rotate. Shared by the
   visible dotted ring and the particles' CSS `offset-path`. */
const ORBIT_PATH =
  "M107,384 a405,250 0 1 0 810,0 a405,250 0 1 0 -810,0";

/* Orbiting particles: fraction = start position along the path (also the
   static fallback when reduced motion is on). */
const ORBIT_DURATION = 26; // seconds per lap
const PARTICLES = [
  { frac: 0.0, big: true },
  { frac: 0.3, big: false },
  { frac: 0.56, big: true },
  { frac: 0.82, big: false },
];

/* Below-photo paragraph lines. */
const BODY_LINES = [
  [0.11, 0.86, 0.55],
  [0.11, 0.9, 0.6],
  [0.11, 0.83, 0.65],
  [0.11, 0.88, 0.7],
  [0.11, 0.58, 0.75],
] as const;

/* Short lines beside the image placeholder. */
const SIDE_LINES = [
  [0.52, 0.9, 0.29],
  [0.52, 0.85, 0.35],
  [0.52, 0.92, 0.41],
] as const;

/* Chart bars: [x, height, opacity] increasing toward a solid mint bar. */
const CHART_BARS: [number, number, number][] = [
  [740, 26, 0.35],
  [762, 40, 0.5],
  [784, 34, 0.45],
  [806, 52, 0.72],
  [828, 66, 1],
];

export function PressHeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1024 768"
      className={className}
      role="img"
      aria-label="Stacked press article with chat and chart bubbles"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ph-page" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e3f6ee" />
        </linearGradient>
        <linearGradient id="ph-bubble" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3fbf8" />
        </linearGradient>
        <radialGradient id="ph-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={MINT} stopOpacity="0.4" />
          <stop offset="100%" stopColor={MINT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ph-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={MINT} stopOpacity="0.14" />
          <stop offset="100%" stopColor={MINT} stopOpacity="0" />
        </radialGradient>
        <filter id="ph-shadow" x="-25%" y="-25%" width="150%" height="170%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor={MINT} floodOpacity="0.12" />
        </filter>
        <filter id="ph-bshadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="9" stdDeviation="12" floodColor={MINT} floodOpacity="0.16" />
        </filter>
      </defs>

      {/* Animations: dotted ring flow + particles orbiting (CSS Motion Path).
          Disabled under prefers-reduced-motion. */}
      <style>{`
        @keyframes ph-dash { to { stroke-dashoffset: -125; } }
        @keyframes ph-orbit { from { offset-distance: 0%; } to { offset-distance: 100%; } }
        .ph-ring { animation: ph-dash 7s linear infinite; }
        .ph-particle {
          offset-path: path("${ORBIT_PATH}");
          offset-rotate: 0deg;
          animation: ph-orbit ${ORBIT_DURATION}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ph-ring, .ph-particle { animation: none; }
        }
      `}</style>

      {/* ── Dotted orbit ring + orbiting particles (tilted) ───────────── */}
      <g transform="rotate(-16 512 384)">
        <path
          className="ph-ring"
          d={ORBIT_PATH}
          fill="none"
          stroke={MINT}
          strokeWidth="2.4"
          strokeDasharray="0.5 12"
          strokeLinecap="round"
          opacity="0.75"
        />

        {PARTICLES.map(({ frac, big }, i) => (
          <g
            key={i}
            className="ph-particle"
            style={{
              offsetDistance: `${frac * 100}%`,
              animationDelay: `-${(frac * ORBIT_DURATION).toFixed(2)}s`,
            }}
          >
            <circle r={big ? 18 : 11} fill="url(#ph-node)" />
            <circle r={big ? 6 : 4} fill="#ffffff" stroke={MINT} strokeWidth={big ? 2.5 : 2} />
            <circle r={big ? 3 : 1.8} fill={INK} />
          </g>
        ))}
      </g>

      {/* ── Ground shadow ─────────────────────────────────────────────── */}
      <ellipse cx="470" cy="640" rx="250" ry="42" fill="url(#ph-ground)" />

      {/* ── Back slab (depth on the right) ────────────────────────────── */}
      <path
        d={roundedPath(offset(PAGE, 62, 66), 18)}
        fill="url(#ph-page)" stroke={MINT} strokeWidth="1.6" strokeOpacity="0.45"
        filter="url(#ph-shadow)"
      />

      {/* ── Stacked sheets (peek at the bottom) ───────────────────────── */}
      <path d={roundedPath(offset(PAGE, 0, 38), 18)} fill="url(#ph-page)" stroke={MINT} strokeWidth="1.6" strokeOpacity="0.5" filter="url(#ph-shadow)" />
      <path d={roundedPath(offset(PAGE, 0, 19), 18)} fill="url(#ph-page)" stroke={MINT} strokeWidth="1.6" strokeOpacity="0.55" filter="url(#ph-shadow)" />

      {/* ── Front page + content ──────────────────────────────────────── */}
      <g filter="url(#ph-shadow)">
        <path d={roundedPath(PAGE, 18)} fill="url(#ph-page)" stroke={MINT} strokeWidth="2" />

        {/* Divider near the top */}
        <line
          x1={f(P(0.07, 0.2)[0])} y1={f(P(0.07, 0.2)[1])}
          x2={f(P(0.93, 0.2)[0])} y2={f(P(0.93, 0.2)[1])}
          stroke={MID} strokeWidth="2.5"
        />

        {/* Image placeholder */}
        <polygon
          points={poly(P(0.11, 0.25), P(0.45, 0.25), P(0.45, 0.5), P(0.11, 0.5))}
          fill={TINT} stroke={MINT} strokeWidth="1.5" strokeOpacity="0.5"
        />
        {/* circle accent */}
        <circle cx={f(P(0.18, 0.31)[0])} cy={f(P(0.18, 0.31)[1])} r="12" fill={MINT} />
        {/* mountain icon (two triangles) */}
        <polygon points={poly(P(0.15, 0.49), P(0.25, 0.35), P(0.34, 0.49))} fill={MINT} opacity="0.55" />
        <polygon points={poly(P(0.28, 0.49), P(0.36, 0.4), P(0.44, 0.49))} fill={INK} opacity="0.55" />

        {/* Short lines beside the image */}
        {SIDE_LINES.map(([u0, u1, v], i) => (
          <polygon key={`s${i}`} points={bar(u0, u1, v, 0.018)} fill={MID} />
        ))}

        {/* Paragraph lines */}
        {BODY_LINES.map(([u0, u1, v], i) => (
          <polygon key={`b${i}`} points={bar(u0, u1, v, 0.016)} fill={MID} />
        ))}
      </g>

      {/* ── Chat bubble (top-left) ────────────────────────────────────── */}
      <g filter="url(#ph-bshadow)">
        <path
          d="M150 190 h114 a22 22 0 0 1 22 22 v54 a22 22 0 0 1 -22 22 h-50 l-20 24 v-24 h-44 a22 22 0 0 1 -22 -22 v-54 a22 22 0 0 1 22 -22 z"
          fill="url(#ph-bubble)" stroke={MINT} strokeWidth="1.6" strokeOpacity="0.55"
        />
        <circle cx="183" cy="239" r="7" fill={MINT} />
        <circle cx="210" cy="239" r="7" fill={MINT} />
        <circle cx="237" cy="239" r="7" fill={INK} />
      </g>

      {/* ── Bar-chart bubble (bottom-right) ───────────────────────────── */}
      <g filter="url(#ph-bshadow)">
        <path
          d="M722 470 h132 a22 22 0 0 1 22 22 v78 a22 22 0 0 1 -22 22 h-96 l-20 24 v-24 h-16 a22 22 0 0 1 -22 -22 v-78 a22 22 0 0 1 22 -22 z"
          fill="url(#ph-bubble)" stroke={MINT} strokeWidth="1.6" strokeOpacity="0.55"
        />
        {/* axis */}
        <path
          d="M740 500 V566 H852"
          fill="none" stroke={MID} strokeWidth="2.5" strokeLinecap="round"
        />
        {/* bars — rising tint → solid → deep mint */}
        {CHART_BARS.map(([x, h], i) => (
          <rect
            key={x}
            x={x}
            y={566 - h}
            width="14"
            height={h}
            rx="3"
            fill={i === CHART_BARS.length - 1 ? INK : i >= 3 ? MINT : MID}
          />
        ))}
      </g>
    </svg>
  );
}

export default PressHeroIllustration;
