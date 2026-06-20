"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Check, ShieldCheck, AlertTriangle } from "lucide-react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const TEAL = "#277E92"; // .orasis-theme --brand-ink

/* -------------------------------------------------------------------------- */
/* 1. Triage & prioritization — a live, reflowing study queue                 */
/* -------------------------------------------------------------------------- */

type Level = "High" | "Medium" | "Low";

const LEVEL_STYLE: Record<Level, { color: string; bg: string }> = {
  High: { color: "#dc2626", bg: "#fef2f2" },
  Medium: { color: "#b45309", bg: "#fffbeb" },
  Low: { color: "#16a34a", bg: "#f0fdf4" },
};

const ARRIVAL_PATTERN: Level[] = ["High", "Low", "Medium", "Low", "High", "Medium"];

interface QueueItem {
  id: number;
  level: Level;
}

const INITIAL_QUEUE: QueueItem[] = [
  { id: 3, level: "High" },
  { id: 2, level: "Medium" },
  { id: 1, level: "Low" },
];

export function TriageDemo() {
  const reduced = usePrefersReducedMotion();
  const [items, setItems] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [studies, setStudies] = useState(24);
  const nextId = useRef(4);
  const patternIndex = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      const level = ARRIVAL_PATTERN[patternIndex.current % ARRIVAL_PATTERN.length];
      patternIndex.current += 1;
      const id = nextId.current++;
      setItems((prev) => [{ id, level }, ...prev].slice(0, 3));
      setStudies((c) => c + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, [reduced]);

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-semibold text-foreground">
          Triage queue
        </span>
        <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-muted">
          {!reduced && (
            <motion.span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: TEAL }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          )}
          {studies} studies
        </span>
      </div>

      <ul className="mt-3 h-[6.75rem] space-y-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const s = LEVEL_STYLE[item.level];
            return (
              <motion.li
                key={item.id}
                layout
                initial={reduced ? false : { opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex items-center justify-between rounded-lg px-2.5 py-2"
                style={{ backgroundColor: s.bg }}
              >
                <span className="flex items-center gap-1.5 text-[0.7rem] font-medium text-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                  Study #{1040 + item.id}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold"
                  style={{ color: s.color, backgroundColor: "rgba(255,255,255,0.6)" }}
                >
                  {item.level}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Hemorrhage detection — scan sweep that reveals the AI heatmap            */
/* -------------------------------------------------------------------------- */

interface ScanState {
  /** Percentage of the heatmap still hidden from the bottom (100 = hidden, 0 = fully revealed). */
  clip: number;
  /** Scan-line vertical position (%). */
  line: number;
  /** Heatmap overlay opacity (used to cross-fade back to the raw scan). */
  opacity: number;
  scanning: boolean;
}

export function HemorrhageDemo() {
  const reduced = usePrefersReducedMotion();
  const [s, setS] = useState<ScanState>(
    reduced
      ? { clip: 0, line: 100, opacity: 1, scanning: false }
      : { clip: 100, line: 0, opacity: 1, scanning: true },
  );

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let start: number | null = null;
    const SCAN = 2200;
    const HOLD = 1500;
    const FADE = 700;
    const GAP = 350;
    const PERIOD = SCAN + HOLD + FADE + GAP;

    const tick = (now: number) => {
      if (start === null) start = now;
      const e = (now - start) % PERIOD;

      let clip = 100;
      let line = 0;
      let opacity = 1;
      let scanning = false;

      if (e < SCAN) {
        const p = 1 - Math.pow(1 - e / SCAN, 3); // easeOutCubic
        clip = (1 - p) * 100;
        line = p * 100;
        scanning = true;
      } else if (e < SCAN + HOLD) {
        clip = 0;
        line = 100;
      } else if (e < SCAN + HOLD + FADE) {
        clip = 0;
        opacity = 1 - (e - (SCAN + HOLD)) / FADE; // cross-fade back to raw scan
      } else {
        clip = 0;
        opacity = 0; // brief gap on the raw scan before the next sweep
      }

      setS({ clip, line, opacity, scanning });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const detected = !s.scanning && s.opacity > 0.5;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border"
      style={{ backgroundColor: "#05070b" }}
    >
      <div className="relative aspect-[4/3]">
        {/* Raw non-contrast scan (base layer) */}
        <Image
          src="/images/without-heatmap.jpg"
          alt="Non-contrast head CT before AI analysis"
          fill
          sizes="(max-width: 1024px) 50vw, 280px"
          className="object-contain"
        />

        {/* AI heatmap, progressively revealed by the scan line */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 ${s.clip}% 0)`, opacity: s.opacity }}
        >
          <Image
            src="/images/with-heatmap.jpg"
            alt="Head CT with an AI heatmap localizing an acute hemorrhage"
            fill
            sizes="(max-width: 1024px) 50vw, 280px"
            className="object-contain"
          />
        </div>

        {/* Scan line */}
        {s.scanning && (
          <div
            className="absolute inset-x-0 h-[2px]"
            style={{
              top: `${s.line}%`,
              background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)`,
              boxShadow: `0 0 10px 2px ${TEAL}`,
            }}
          />
        )}
      </div>

      {/* Status chip */}
      {detected ? (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white/95">
          <AlertTriangle className="size-3 text-[#fca5a5]" strokeWidth={2.4} />
          Hemorrhage detected
        </span>
      ) : (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white/95">
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: TEAL }}
          />
          Scanning…
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Mass effect & shift — an animated caliper measuring the midline shift    */
/* -------------------------------------------------------------------------- */

const SHIFT_TARGET = 6.2; // mm
const MAX_SHIFT_PX = 30;

export function MassEffectDemo() {
  const reduced = usePrefersReducedMotion();
  const [mm, setMm] = useState(reduced ? SHIFT_TARGET : 0);

  useEffect(() => {
    if (reduced) {
      setMm(SHIFT_TARGET);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const DUR = 1600;
    const HOLD = 1300;
    const PERIOD = DUR + HOLD;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = (now - start) % PERIOD;
      const p = Math.min(1, t / DUR);
      const eased = 1 - Math.pow(1 - p, 3);
      setMm(Math.round(eased * SHIFT_TARGET * 10) / 10);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const offset = (mm / SHIFT_TARGET) * MAX_SHIFT_PX;

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <span className="text-[0.65rem] font-medium text-muted">Midline shift</span>
      <p className="mt-0.5 text-2xl font-bold tracking-[-0.02em] text-foreground">
        {mm.toFixed(1)} <span className="text-base font-semibold text-muted">mm</span>
      </p>

      {/* Caliper diagram */}
      <div className="relative mt-2 h-12 overflow-hidden rounded-lg bg-[#05070b]">
        {/* Anatomical reference midline (where it should be) */}
        <div
          className="absolute top-1 bottom-1 left-1/2 w-0 -translate-x-1/2 border-l border-dashed"
          style={{ borderColor: "rgba(226,232,240,0.45)" }}
        />
        {/* Actual (shifted) midline */}
        <div
          className="absolute top-1 bottom-1 w-[2px]"
          style={{
            left: `calc(50% + ${offset}px)`,
            backgroundColor: TEAL,
            boxShadow: `0 0 6px ${TEAL}`,
          }}
        />
        {/* Measurement bracket */}
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2"
          style={{
            left: "50%",
            width: `${offset}px`,
            backgroundColor: "rgba(245,158,11,0.9)",
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[0.65rem] font-medium text-muted">Mass effect</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.65rem] font-semibold text-brand-ink">
          Likely
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Structured reporting — a validation sweep that checks off each field     */
/* -------------------------------------------------------------------------- */

const REPORT_ROWS = [
  { label: "Indication", value: "Headache, trauma" },
  { label: "Technique", value: "NCCT Head" },
  { label: "Findings", value: "Acute hemorrhage" },
  { label: "Impression", value: "Finalized" },
];

export function ReportDemo() {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(reduced ? REPORT_ROWS.length : 0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStep(REPORT_ROWS.length);
      return;
    }
    setStep(0);
    const timers = REPORT_ROWS.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 650),
    );
    const reset = setTimeout(
      () => setCycle((c) => c + 1),
      REPORT_ROWS.length * 650 + 2400,
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(reset);
    };
  }, [cycle, reduced]);

  const done = step >= REPORT_ROWS.length;

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-semibold text-foreground">
          Structured report
        </span>
        <AnimatePresence>
          {done && (
            <motion.span
              key="badge"
              className="inline-flex items-center gap-1 rounded-full bg-[#16a34a] px-1.5 py-0.5 text-[0.6rem] font-bold text-white"
              initial={reduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
            >
              <ShieldCheck className="size-3" strokeWidth={2.5} />
              Finalized
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <ul className="mt-2.5 space-y-1.5">
        {REPORT_ROWS.map((row, i) => {
          const checked = step > i;
          const current = step === i;
          return (
            <li
              key={row.label}
              className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors duration-300"
              style={{
                backgroundColor: current ? "rgba(39,126,146,0.10)" : "transparent",
              }}
            >
              <span
                className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: checked ? "#16a34a" : "transparent",
                  border: checked ? "none" : "1.5px solid hsl(var(--border))",
                }}
              >
                {checked && <Check className="size-2.5 text-white" strokeWidth={3} />}
              </span>
              <span className="text-[0.65rem] text-muted">{row.label}</span>
              <span
                className="ml-auto truncate text-[0.65rem] font-semibold transition-colors duration-300"
                style={{ color: checked ? "hsl(var(--foreground))" : "hsl(var(--muted))" }}
              >
                {row.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
