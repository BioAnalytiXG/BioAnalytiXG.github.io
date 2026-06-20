"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Animated "Smart Quizzes" preview.
 *
 * Loops a scripted answer: the options stagger in, the correct option gets
 * selected, then reveals as correct (green + check) with an XP chip. Honors
 * `prefers-reduced-motion` by showing the answered state statically.
 */
const QUIZZES = [
  {
    question: "Which muscle abducts the arm?",
    options: [
      { label: "A. Deltoid", correct: true },
      { label: "B. Biceps brachii", correct: false },
      { label: "C. Triceps brachii", correct: false },
    ],
  },
  {
    question: "Which nerve innervates the diaphragm?",
    options: [
      { label: "A. Vagus nerve", correct: false },
      { label: "B. Phrenic nerve", correct: true },
      { label: "C. Intercostal nerves", correct: false },
    ],
  },
  {
    question: "How many bones are in the adult human hand?",
    options: [
      { label: "A. 14", correct: false },
      { label: "B. 19", correct: false },
      { label: "C. 27", correct: true },
    ],
  },
];

// step 0: options idle · 1: correct option selected · 2: revealed correct
const SELECT_MS = 1200;
const REVEAL_MS = 1900;
const RESET_MS = 4600;

export function QuizDemo() {
  const reduced = usePrefersReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState(reduced ? 2 : 0);

  useEffect(() => {
    if (reduced) {
      setStep(2);
      return;
    }
    setStep(0);
    const t1 = setTimeout(() => setStep(1), SELECT_MS);
    const t2 = setTimeout(() => setStep(2), REVEAL_MS);
    const t3 = setTimeout(() => setCycle((c) => c + 1), RESET_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [cycle, reduced]);

  const quizIndex = cycle % QUIZZES.length;
  const quiz = QUIZZES[quizIndex];

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted">
          Question {quizIndex + 1} of {QUIZZES.length}
        </span>
        <span className="inline-flex gap-0.5">
          {QUIZZES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 w-3 rounded-full transition-colors duration-300",
                i <= quizIndex ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </span>
      </div>

      <p
        key={`q-${cycle}`}
        className={cn(
          "mt-1.5 text-[0.78rem] font-semibold leading-snug text-foreground",
          !reduced && "animate-in fade-in-0",
        )}
      >
        {quiz.question}
      </p>

      {/* Options (re-key per cycle to replay the stagger-in) */}
      <ul key={cycle} className="mt-2.5 space-y-1.5">
        {quiz.options.map((opt, i) => {
          const active = step >= 1 && opt.correct;
          const revealed = step >= 2 && opt.correct;
          return (
            <li
              key={opt.label}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[0.7rem] transition-colors duration-300",
                revealed
                  ? "border-emerald-500/60 bg-emerald-50 text-emerald-700"
                  : active
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted",
                !reduced && "animate-in fade-in-0 slide-in-from-bottom-1",
              )}
              style={
                reduced
                  ? undefined
                  : { animationDelay: `${i * 90}ms`, animationFillMode: "both" }
              }
            >
              {/* Marker */}
              <span
                className={cn(
                  "inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                  revealed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                      ? "border-primary"
                      : "border-border",
                )}
              >
                {revealed ? <Check className="size-2.5" strokeWidth={3} /> : null}
                {active && !revealed ? (
                  <span className="size-1.5 rounded-full bg-primary" />
                ) : null}
              </span>
              <span className="truncate font-medium">{opt.label}</span>
            </li>
          );
        })}
      </ul>

      {/* Feedback */}
      <div className="mt-2 h-4">
        {step >= 2 ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-700",
              !reduced && "animate-in fade-in-0 zoom-in-95",
            )}
          >
            <Check className="size-3" strokeWidth={3} />
            Correct · +10 XP
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default QuizDemo;
