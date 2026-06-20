"use client";

import { useEffect, useRef, useState } from "react";
import {
  SquarePen,
  Home,
  BarChart3,
  CalendarCheck,
  NotebookPen,
  BookOpen,
  ClipboardCheck,
  ListChecks,
  AlertTriangle,
  Layers,
  ChevronRight,
  ChevronLeft,
  Lock,
  type LucideIcon,
} from "lucide-react";

import { GnosisAvatar } from "@/components/gnosis-avatar";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * The real Gnosis AI web app, rendered at true desktop size and scaled to fit.
 *
 * Faithful port of the latest frontend
 * (`gnosisai-agents/frontend`): the 264px collapsible sidebar
 * (`src/components/SidebarLayout.vue`) plus the student dashboard
 * (`src/views/DashboardView.vue`), using the app's real design tokens
 * (`src/assets/theme.css`) — teal `#4C8A99` on blush-white `#FDFAFD`, `#F6F3F8`
 * surfaces, 20px cards. The window is laid out at a fixed desktop size and
 * shrunk via a `ResizeObserver`-driven CSS `transform: scale()`, so proportions
 * match the real app at any width.
 *
 * Static, non-interactive preview seeded with demo data; a snapshot of the real
 * UI (update if the app changes).
 */

// --- App theme tokens (theme.css, light) ---
const TEAL = "#4C8A99";
const TEAL_HOVER = "#5B9CA7";
const SURFACE = "#FDFAFD";
const SURFACE_ALT = "#F6F3F8";
const ON_PRIMARY = "#FDFAFD";
const BORDER = "rgba(0,0,0,0.10)";
const DIVIDER = "rgba(0,0,0,0.06)";
const MUTED = "rgba(0,0,0,0.65)";
const PRIMARY_TINT = "rgba(76,138,153,0.12)";
const CARD_SHADOW = "0 8px 24px rgba(0,0,0,0.05)";
const WARNING = "#b45309";
const INFO = "#2196f3";

// --- Fixed desktop design size (scaled to fit the container) ---
const DESIGN_W = 1240;
const DESIGN_H = 880;

// --- Seeded demo data ---
const NAME = "Alex";

export function GnosisDashboardPreview() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const reduced = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = (width: number) => setScale(width / DESIGN_W);
    update(el.clientWidth);
    const ro = new ResizeObserver((entries) => update(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One-time entrance, triggered on (re)load when the component mounts.
  useEffect(() => {
    if (reduced) {
      setRevealed(true);
      return;
    }
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="The Gnosis AI student dashboard app"
      className="relative w-full overflow-hidden rounded-xl border border-black/10 shadow-2xl"
      style={{ aspectRatio: `${DESIGN_W} / ${DESIGN_H}` }}
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
          backgroundColor: SURFACE,
        }}
      >
        <WindowChrome />
        <div className="flex" style={{ height: DESIGN_H - 40 }}>
          <Sidebar show={revealed} reduced={reduced} />
          <DashboardContent show={revealed} reduced={reduced} />
        </div>
      </div>
    </div>
  );
}

function WindowChrome() {
  return (
    <div
      className="flex h-10 items-center gap-4 border-b border-black/10 px-4"
      style={{ backgroundColor: SURFACE_ALT }}
    >
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full bg-[#FF5F57]" />
        <span className="size-3 rounded-full bg-[#FEBC2E]" />
        <span className="size-3 rounded-full bg-[#28C840]" />
      </div>
      <div className="mx-auto flex items-center gap-2 rounded-md bg-white px-4 py-1.5 text-xs text-black/50 shadow-sm">
        <Lock className="size-3" />
        app.gnosisai.app
      </div>
    </div>
  );
}

/** One-time entrance wrapper: fades/slides its content in when `show` flips. */
function Reveal({
  show,
  reduced,
  delay = 0,
  from = "up",
  className,
  children,
}: {
  show: boolean;
  reduced: boolean;
  delay?: number;
  from?: "up" | "left";
  className?: string;
  children: React.ReactNode;
}) {
  const hidden = from === "left" ? "translateX(-16px)" : "translateY(14px)";
  return (
    <div
      className={className}
      style={
        reduced
          ? undefined
          : {
              opacity: show ? 1 : 0,
              transform: show ? "none" : hidden,
              transition:
                "opacity 600ms ease, transform 600ms cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: `${delay}ms`,
            }
      }
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar (port of SidebarLayout.vue, 264px student nav)                     */
/* -------------------------------------------------------------------------- */

interface NavLink {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  dot?: string;
}

const MENU: NavLink[] = [
  { icon: Home, label: "Home", active: true },
  { icon: BarChart3, label: "Progress" },
];
const LEARNING: NavLink[] = [
  { icon: CalendarCheck, label: "Daily session" },
  { icon: NotebookPen, label: "Study plan" },
  { icon: BookOpen, label: "Course" },
  { icon: ClipboardCheck, label: "Diagnostic test" },
];
const PRACTICE: NavLink[] = [
  { icon: ListChecks, label: "Quiz" },
  { icon: AlertTriangle, label: "Weak areas", dot: WARNING },
  { icon: Layers, label: "Flashcards", dot: INFO },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-1 mt-3 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.08em]"
      style={{ color: MUTED }}
    >
      {children}
    </p>
  );
}

function NavRow({ item }: { item: NavLink }) {
  const Icon = item.icon;
  return (
    <div
      className="flex items-center gap-3 rounded-[11px] px-2.5 py-2 text-sm"
      style={{
        backgroundColor: item.active ? PRIMARY_TINT : "transparent",
        color: item.active ? TEAL : "#000",
        fontWeight: item.active ? 600 : 500,
      }}
    >
      {item.dot ? (
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.dot }} />
      ) : null}
      <Icon className="size-[1.15rem] shrink-0" strokeWidth={1.75} />
      <span className="truncate">{item.label}</span>
    </div>
  );
}

function Sidebar({ show, reduced }: { show: boolean; reduced: boolean }) {
  return (
    <aside
      className="flex w-[264px] shrink-0 flex-col border-r p-3"
      style={{
        backgroundColor: SURFACE,
        borderColor: BORDER,
        ...(reduced
          ? {}
          : {
              opacity: show ? 1 : 0,
              transform: show ? "none" : "translateX(-20px)",
              transition:
                "opacity 600ms ease, transform 600ms cubic-bezier(0.22,1,0.36,1)",
            }),
      }}
    >
      {/* Brand + collapse */}
      <div className="mb-3 flex items-center justify-between px-1">
        <img
          src="/images/gnosis-logo.png"
          alt="GnosisAI"
          className="size-9 rounded-lg object-contain"
        />
        <ChevronLeft className="size-4" style={{ color: MUTED }} />
      </div>

      {/* New chat */}
      <div
        className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
        style={{ backgroundColor: SURFACE_ALT, borderColor: BORDER, color: "#000" }}
      >
        <SquarePen className="size-[1.15rem]" strokeWidth={1.75} />
        New chat
      </div>

      <div className="flex-1 overflow-hidden">
        <SectionLabel>Menu</SectionLabel>
        {MENU.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}

        <div className="my-2 h-px" style={{ backgroundColor: DIVIDER }} />

        <SectionLabel>Nosi</SectionLabel>
        <div className="flex items-center gap-3 rounded-[11px] px-2.5 py-2 text-sm font-medium text-black">
          <GnosisAvatar size={24} state="idle" />
          <span className="flex-1">Nosi</span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-bold tracking-wide"
            style={{ backgroundColor: "rgba(76,138,153,0.18)", color: TEAL }}
          >
            BETA
          </span>
        </div>

        <div className="my-2 h-px" style={{ backgroundColor: DIVIDER }} />

        <SectionLabel>Learning</SectionLabel>
        {LEARNING.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}

        <div className="my-2 h-px" style={{ backgroundColor: DIVIDER }} />

        <SectionLabel>Practice</SectionLabel>
        {PRACTICE.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}
      </div>

      {/* Profile */}
      <div className="mt-2 flex items-center gap-3 px-1 py-1">
        <span
          className="inline-flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: TEAL }}
        >
          AL
        </span>
        <span className="text-sm font-semibold text-black">{NAME}</span>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard content (port of DashboardView.vue)                              */
/* -------------------------------------------------------------------------- */

const RECOMMENDATIONS = [
  {
    title: "Brachial plexus",
    meta: "high exam importance · very low mastery · 22% mastery · 12 questions",
  },
  {
    title: "Scapula landmarks",
    meta: "weak area · 38% mastery · 10 questions",
  },
  {
    title: "Forearm muscles",
    meta: "needs practice · 55% mastery · 8 questions",
  },
];

const STATUS_CHIPS: { label: string; bg: string; color: string }[] = [
  { label: "Weak: 5", bg: "#fdecea", color: "#dc2626" },
  { label: "Improving: 8", bg: "#fff7e0", color: "#b45309" },
  { label: "Good: 12", bg: "#e8f5e9", color: "#16a34a" },
  { label: "Mastered: 4", bg: "#e3f2fd", color: "#2196f3" },
];

function Eyebrow({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <p
      className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
      style={{ color: accent ? TEAL : MUTED }}
    >
      {children}
    </p>
  );
}

function cardStyle() {
  return {
    backgroundColor: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: 20,
    boxShadow: CARD_SHADOW,
  } as React.CSSProperties;
}

/** Pill button rendered with explicit styles so it always sizes/centers correctly. */
function PillButton({
  children,
  primary = false,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "11px 20px",
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        backgroundColor: primary ? TEAL : SURFACE_ALT,
        color: primary ? ON_PRIMARY : "#000",
        border: primary ? "1px solid transparent" : `1px solid ${BORDER}`,
      }}
    >
      {children}
    </span>
  );
}

function DashboardContent({ show, reduced }: { show: boolean; reduced: boolean }) {
  const [pct, setPct] = useState(reduced ? 83 : 0);

  useEffect(() => {
    if (reduced) {
      setPct(83);
      return;
    }
    if (!show) return;
    let raf = 0;
    const DELAY = 500;
    const DURATION = 1100;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start - DELAY) / DURATION));
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(Math.round(eased * 83));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, reduced]);

  return (
    <div
      className="flex-1 overflow-hidden p-8"
      style={{ backgroundColor: SURFACE }}
    >
      {/* Header */}
      <Reveal show={show} reduced={reduced} delay={0}>
        <header className="mb-6">
          <Eyebrow>Monday, June 16</Eyebrow>
          <h2 className="mt-1 text-3xl font-medium tracking-[-0.5px] text-black">
            Good morning, {NAME}
          </h2>
        </header>
      </Reveal>

      <div className="space-y-5">
        {/* Today's focus (full width) */}
        <Reveal show={show} reduced={reduced} delay={120}>
          <section
            className="flex items-center justify-between gap-6 p-6"
            style={{
              ...cardStyle(),
              background: `linear-gradient(135deg, ${SURFACE}, ${SURFACE_ALT})`,
            }}
          >
            <div>
              <Eyebrow accent>Today&apos;s focus</Eyebrow>
              <h3 className="mt-1 text-2xl font-semibold text-black">
                Upper limb: bones &amp; joints
              </h3>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                Continue your study plan — today&apos;s session targets your weak areas.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <PillButton primary>
                  Start daily session
                  <ChevronRight className="size-4" />
                </PillButton>
                <PillButton>View study plan</PillButton>
              </div>
            </div>
            <NotebookPen
              className="size-16 shrink-0"
              style={{ color: TEAL, opacity: 0.85 }}
              strokeWidth={1.5}
            />
          </section>
        </Reveal>

        {/* Recommended quizzes (full width) */}
        <Reveal show={show} reduced={reduced} delay={240}>
          <section className="p-6" style={cardStyle()}>
            <Eyebrow accent>Recommended for you</Eyebrow>
            <h3 className="mt-1 text-xl font-semibold text-black">
              Quizzes to take next
            </h3>
            <p className="mb-4 mt-1 text-sm" style={{ color: MUTED }}>
              Ranked by what matters most — high exam-weight topics where
              you&apos;re weakest. Tap one to start.
            </p>
            <div className="flex flex-col gap-2.5">
              {RECOMMENDATIONS.map((rec, i) => (
                <div
                  key={rec.title}
                  className="flex items-center rounded-[14px] border px-4 py-3"
                  style={{ backgroundColor: SURFACE_ALT, borderColor: BORDER, gap: "0.85rem" }}
                >
                  <span
                    className="inline-flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ width: 30, height: 30, backgroundColor: TEAL }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-black">
                      {rec.title}
                    </span>
                    <span className="truncate text-xs" style={{ color: MUTED }}>
                      {rec.meta}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0" style={{ color: MUTED }} />
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Course + Overall progress (two columns) */}
        <Reveal show={show} reduced={reduced} delay={380}>
          <div className="grid grid-cols-2 gap-5">
            <section className="p-6" style={cardStyle()}>
              <Eyebrow>Your course</Eyebrow>
              <h3 className="mt-1 text-xl font-semibold text-black">Anatomy 1</h3>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                Foundations of human anatomy for first-year medical students.
              </p>
              <div className="my-3 flex gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: SURFACE_ALT, color: MUTED }}
                >
                  8 modules
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: SURFACE_ALT, color: MUTED }}
                >
                  64 topics
                </span>
              </div>
              <PillButton>View course</PillButton>
            </section>

            <section className="p-6" style={cardStyle()}>
              <Eyebrow>Overall progress</Eyebrow>
              <div className="my-2 flex items-center gap-4">
                <span
                  className="text-3xl font-bold"
                  style={{ color: TEAL, fontFamily: "var(--font-display)" }}
                >
                  {pct}%
                </span>
                <span
                  className="h-2.5 flex-1 overflow-hidden rounded-full"
                  style={{ backgroundColor: SURFACE_ALT }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: "83%",
                      backgroundColor: TEAL,
                      transformOrigin: "left",
                      transform: reduced ? "none" : show ? "scaleX(1)" : "scaleX(0)",
                      transition: reduced
                        ? undefined
                        : "transform 1100ms cubic-bezier(0.22,1,0.36,1) 500ms",
                    }}
                  />
                </span>
              </div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {STATUS_CHIPS.map((chip) => (
                  <span
                    key={chip.label}
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: chip.bg, color: chip.color }}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
              <PillButton>View analytics</PillButton>
            </section>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default GnosisDashboardPreview;
