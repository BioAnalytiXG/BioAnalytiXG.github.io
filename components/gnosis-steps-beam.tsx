"use client";

import { forwardRef, useRef } from "react";
import {
  ClipboardCheck,
  Target,
  MessageCircle,
  BarChart3,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: ClipboardCheck,
    title: "Diagnostic test",
    description: "Identify your current knowledge and gaps.",
  },
  {
    icon: Target,
    title: "Daily mission",
    description: "A personalized study plan with focused goals.",
  },
  {
    icon: MessageCircle,
    title: "Learn with Nosi",
    description: "Ask anything, get clear, grounded explanations.",
  },
  {
    icon: BarChart3,
    title: "Quiz & progress",
    description: "Practice and strengthen your weak areas.",
  },
];

/**
 * Left-column step card. The forwarded ref points at a zero-size anchor on the
 * card's right edge, so beams emanate cleanly from the edge (never across the
 * card content).
 */
const StepNode = forwardRef<HTMLSpanElement, { step: Step; index: number }>(
  ({ step, index }, ref) => {
    const Icon = step.icon;
    return (
      <div className="relative z-10 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
          <span className="absolute -right-1.5 -top-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
            {index + 1}
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{step.title}</p>
          <p className="truncate text-xs text-muted">{step.description}</p>
        </div>
        <span ref={ref} aria-hidden className="absolute right-0 top-1/2 size-0" />
      </div>
    );
  },
);
StepNode.displayName = "StepNode";

/**
 * Animated "how it works" flow: the four study steps route through clean,
 * right-angled animated beams into the Gnosis AI hub, then out to the outcome.
 */
export function GnosisStepsBeam() {
  const containerRef = useRef<HTMLDivElement>(null);
  const step0 = useRef<HTMLSpanElement>(null);
  const step1 = useRef<HTMLSpanElement>(null);
  const step2 = useRef<HTMLSpanElement>(null);
  const step3 = useRef<HTMLSpanElement>(null);
  const hubLeft = useRef<HTMLSpanElement>(null);
  const hubRight = useRef<HTMLSpanElement>(null);
  const outcomeLeft = useRef<HTMLSpanElement>(null);

  const stepRefs = [step0, step1, step2, step3];

  return (
    <>
      {/* Mobile: simple vertical step stack (the beam diagram needs width) */}
      <ol className="mx-auto flex max-w-md flex-col gap-4 md:hidden">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                <span className="absolute -right-1.5 -top-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted">{step.description}</p>
              </div>
            </li>
          );
        })}
        <li className="flex items-center gap-3 rounded-xl bg-primary p-4 text-primary-foreground shadow-md">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
            <GraduationCap className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Exam-ready</p>
            <p className="text-xs text-primary-foreground/80">
              Gnosis AI turns each step into measurable progress.
            </p>
          </div>
        </li>
      </ol>

      {/* md+: animated beam flow */}
      <div
        ref={containerRef}
        className="relative mx-auto hidden w-full max-w-4xl grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-12 sm:gap-x-20 md:grid"
      >
        {/* Left: the four steps */}
        <div className="flex flex-col justify-center gap-6">
          {STEPS.map((step, index) => (
            <StepNode key={step.title} ref={stepRefs[index]} step={step} index={index} />
          ))}
        </div>

        {/* Center: Gnosis AI hub */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative z-10 flex size-20 items-center justify-center rounded-2xl border border-border bg-card shadow-md">
            <img src="/images/gnosis-logo.png" alt="Gnosis AI" className="h-9 w-auto" />
            <span ref={hubLeft} aria-hidden className="absolute left-0 top-1/2 size-0" />
            <span ref={hubRight} aria-hidden className="absolute right-0 top-1/2 size-0" />
          </div>
          <span className="text-xs font-semibold text-foreground">Gnosis AI</span>
        </div>

        {/* Right: outcome */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative z-10 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <GraduationCap className="size-7" strokeWidth={1.75} aria-hidden="true" />
            <span ref={outcomeLeft} aria-hidden className="absolute left-0 top-1/2 size-0" />
          </div>
          <span className="text-xs font-semibold text-foreground">Exam-ready</span>
        </div>

        {/* Beams: each step → hub (orthogonal, merging into a shared trunk) */}
        {stepRefs.map((ref, index) => (
          <AnimatedBeam
            key={index}
            containerRef={containerRef}
            fromRef={ref}
            toRef={hubLeft}
            orthogonal
            pathWidth={2}
            duration={2.2}
            delay={index * 0.45}
            repeatDelay={0.7}
          />
        ))}

        {/* Beam: hub → outcome (straight) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={hubRight}
          toRef={outcomeLeft}
          orthogonal
          pathWidth={2}
          duration={2.2}
          delay={1}
          repeatDelay={0.7}
        />
      </div>
    </>
  );
}

export default GnosisStepsBeam;
