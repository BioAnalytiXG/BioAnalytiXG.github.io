"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  Upload,
  ScanLine,
  Eye,
  FileCheck,
  Check,
  FileText,
  AlertTriangle,
  Ruler,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Shine } from "@/components/animate-ui/primitives/effects/shine";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const TEAL = "#277E92"; // .orasis-theme --brand-ink
const STEP_MS = 3200;

interface Step {
  icon: LucideIcon;
  short: string;
  title: string;
  description: string;
  Scene: (props: { reduced: boolean }) => React.ReactNode;
}

const STEPS: Step[] = [
  {
    icon: Upload,
    short: "Upload",
    title: "Upload study",
    description: "Non-contrast head CT is ingested from PACS.",
    Scene: UploadScene,
  },
  {
    icon: ScanLine,
    short: "Analyze",
    title: "AI analysis",
    description: "OrasisAI analyzes the scan and highlights key findings.",
    Scene: AnalyzeScene,
  },
  {
    icon: Eye,
    short: "Review",
    title: "Review insights",
    description: "Radiologist reviews AI insights, heatmaps, and key images.",
    Scene: ReviewScene,
  },
  {
    icon: FileCheck,
    short: "Report",
    title: "Report with confidence",
    description: "Generate a structured report and finalize the impression.",
    Scene: ReportScene,
  },
];

/**
 * Animated "how it works" pipeline.
 *
 * A self-advancing process rail: each of the four head-CT stages activates in
 * sequence (the connector between stages fills as it progresses), while a
 * showcase panel crossfades a bespoke mini-animation for the active step — an
 * upload progress fill, a sweeping CT scan-line over the raw scan, the AI
 * heatmap with insight chips popping in, and a report drawing itself with a
 * confidence stamp. The active stage card carries a looping light sweep via the
 * `@animate-ui` Shine primitive. Stages are clickable, and all motion is
 * disabled under `prefers-reduced-motion`.
 */
export function OrasisProcessFlow() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (reduced) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setActive((a) => (a + 1) % STEPS.length),
      STEP_MS,
    );
  }, [reduced]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [startTimer]);

  const select = (index: number) => {
    setActive(index);
    startTimer();
  };

  const ActiveScene = STEPS[active].Scene;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress rail */}
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const state = i < active ? "done" : i === active ? "current" : "upcoming";
          return (
            <div
              key={step.title}
              className="flex flex-1 items-start last:flex-none"
            >
              {/* Node + label */}
              <button
                type="button"
                onClick={() => select(i)}
                className="group flex shrink-0 flex-col items-center gap-2 focus:outline-none"
                aria-label={`Step ${i + 1}: ${step.title}`}
                aria-current={state === "current"}
              >
                <span className="relative inline-flex size-12 items-center justify-center">
                  {/* Pulsing ring on the current node */}
                  {state === "current" && !reduced && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${TEAL}` }}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.45, opacity: 0 }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <motion.span
                    className="relative inline-flex size-12 items-center justify-center rounded-full border shadow-sm"
                    animate={{
                      backgroundColor: state === "upcoming" ? "#ffffff" : TEAL,
                      borderColor: state === "upcoming" ? "#e2e8f0" : TEAL,
                      scale: state === "current" ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {state === "done" ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Check className="size-5 text-white" strokeWidth={2.5} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="icon"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Icon
                            className="size-5"
                            strokeWidth={1.9}
                            style={{ color: state === "upcoming" ? "hsl(var(--muted))" : "#fff" }}
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>
                </span>

                <span className="flex flex-col items-center">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                    Step {i + 1}
                  </span>
                  <span
                    className="text-xs font-semibold transition-colors sm:text-sm"
                    style={{
                      color:
                        state === "upcoming" ? "hsl(var(--muted))" : "hsl(var(--brand-ink))",
                    }}
                  >
                    {step.short}
                  </span>
                </span>
              </button>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="mx-1 mt-6 h-1 flex-1 overflow-hidden rounded-full bg-border sm:mx-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: TEAL, transformOrigin: "left" }}
                    initial={false}
                    animate={{ scaleX: i < active ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Showcase panel */}
      <Shine
        color={TEAL}
        opacity={0.16}
        duration={1600}
        loop
        loopDelay={1800}
        enable={!reduced}
        className="mt-10 rounded-2xl"
      >
        <div className="grid items-stretch gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-2 md:p-6">
          {/* Mini scene */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <ActiveScene reduced={reduced} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Copy */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-brand-ink">
              Step {active + 1} of {STEPS.length}
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <h3 className="mt-3 text-xl font-bold tracking-[-0.01em] text-foreground">
                  {STEPS[active].title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {STEPS[active].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="mt-6 flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => select(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === active ? 28 : 10,
                    backgroundColor: i === active ? TEAL : "hsl(var(--border))",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Shine>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mini scenes                                                                */
/* -------------------------------------------------------------------------- */

function UploadScene({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface px-4">
      <motion.div
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
        animate={reduced ? undefined : { y: [4, -4, 4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <FileText className="size-5 text-brand-ink" strokeWidth={1.85} />
        <span className="text-xs font-semibold text-foreground">NCCT_head.dcm</span>
        <Upload className="size-4 text-muted" strokeWidth={1.85} />
      </motion.div>

      <div className="w-3/5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: TEAL, transformOrigin: "left" }}
            initial={{ scaleX: reduced ? 1 : 0 }}
            animate={reduced ? { scaleX: 1 } : { scaleX: [0, 1] }}
            transition={
              reduced
                ? undefined
                : { duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }
            }
          />
        </div>
      </div>
      <span className="text-[0.7rem] font-medium text-muted">
        Ingesting from PACS…
      </span>
    </div>
  );
}

function AnalyzeScene({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070b]">
      <Image
        src="/images/without-heatmap.jpg"
        alt="Non-contrast head CT being analyzed by OrasisAI"
        fill
        sizes="(max-width: 768px) 90vw, 360px"
        className="object-contain"
      />

      {/* Scan line sweeping top → bottom */}
      {!reduced && (
        <motion.div
          className="absolute inset-x-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)`,
            boxShadow: `0 0 8px ${TEAL}`,
          }}
          initial={{ top: "8%" }}
          animate={{ top: ["8%", "92%", "8%"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/45 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white/90">
        <ScanLine className="size-3" />
        Analyzing…
      </span>
    </div>
  );
}

function ReviewScene({ reduced }: { reduced: boolean }) {
  const chips = [
    { icon: AlertTriangle, label: "Hemorrhage", tone: "#fca5a5" },
    { icon: Ruler, label: "Midline shift 6.2 mm", tone: "#fcd34d" },
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070b]">
      <Image
        src="/images/with-heatmap.jpg"
        alt="Head CT with an AI heatmap highlighting a suspected hemorrhage"
        fill
        sizes="(max-width: 768px) 90vw, 360px"
        className="object-contain"
      />

      {/* Insight chips */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5">
        {chips.map((chip, i) => {
          const Icon = chip.icon;
          return (
            <motion.span
              key={chip.label}
              className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[0.6rem] font-semibold text-[#0f172a] shadow-sm"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.4 + i * 0.35, duration: 0.4 }}
            >
              <Icon className="size-3" style={{ color: chip.tone }} strokeWidth={2.2} />
              {chip.label}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

function ReportScene({ reduced }: { reduced: boolean }) {
  const lines = [
    { w: "90%", label: "Indication: headache, trauma" },
    { w: "100%", label: "Technique: NCCT Head" },
    { w: "75%", label: "Findings: acute hemorrhage" },
    { w: "60%", label: "Impression: finalized" },
  ];
  return (
    <div className="relative flex h-full w-full flex-col justify-center gap-2 bg-surface px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-bold text-foreground">
          Structured report
        </span>
        <motion.span
          className="inline-flex items-center gap-1 rounded-full bg-[#16a34a] px-1.5 py-0.5 text-[0.6rem] font-bold text-white"
          initial={reduced ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.5, type: "spring", stiffness: 300, damping: 16 }}
        >
          <ShieldCheck className="size-3" strokeWidth={2.5} />
          Confident
        </motion.span>
      </div>

      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <div key={line.label} className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: i === 3 ? TEAL : "hsl(var(--muted) / 0.5)", transformOrigin: "left" }}
                initial={reduced ? { scaleX: parseFloat(line.w) / 100 } : { scaleX: 0 }}
                animate={{ scaleX: parseFloat(line.w) / 100 }}
                transition={{ delay: reduced ? 0 : 0.3 + i * 0.3, duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <span className="mt-1 text-[0.6rem] font-medium text-muted">
        Auto-generated, radiologist-finalized
      </span>
    </div>
  );
}

export default OrasisProcessFlow;
