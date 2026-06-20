"use client";

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Animated flashcards preview.
 *
 * Loops through 3 cards. Each card springs in from the right, shows the
 * question, flips on its Y axis to reveal the answer, then swipes out to the
 * left as the next card springs in. The flip (inner) and the swipe (outer) are
 * separate transforms so they never fight each other. Honors
 * `prefers-reduced-motion` (no flip/swipe; shows the question statically).
 */
interface Flashcard {
  q: string;
  a: string;
}

const CARDS: Flashcard[] = [
  { q: "Origin of the pectoralis major?", a: "Clavicle, sternum, and costal cartilages." },
  { q: "Which nerve innervates the deltoid?", a: "The axillary nerve (C5–C6)." },
  { q: "Action of the biceps brachii?", a: "Flexes the elbow and supinates the forearm." },
];

type Phase = "front" | "flipped" | "leaving";

const FRONT_MS = 2600;
const FLIPPED_MS = 3400;
const LEAVE_MS = 750;

const styles = `
@keyframes flashcard-in {
  0% { transform: translateX(55%) rotate(7deg) scale(0.92); opacity: 0; }
  100% { transform: translateX(0) rotate(0) scale(1); opacity: 1; }
}
@keyframes flashcard-out {
  0%   { transform: translateX(0) rotate(0deg) scale(1); opacity: 1; filter: blur(0); }
  20%  { transform: translateX(7%) rotate(3deg) scale(1.02); opacity: 1; }
  100% { transform: translateX(-150%) rotate(-15deg) scale(0.85); opacity: 0; filter: blur(1.5px); }
}
@media (prefers-reduced-motion: reduce) {
  [data-flashcard-swipe] { animation: none !important; }
}
`;

export function FlashcardsDemo() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("front");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) return;
    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
    };

    if (phase === "front") {
      timer.current = setTimeout(() => setPhase("flipped"), FRONT_MS);
    } else if (phase === "flipped") {
      timer.current = setTimeout(() => setPhase("leaving"), FLIPPED_MS);
    } else if (phase === "leaving") {
      timer.current = setTimeout(() => {
        setIndex((i) => (i + 1) % CARDS.length);
        setPhase("front");
      }, LEAVE_MS);
    }

    return clear;
  }, [phase, reduced]);

  const card = CARDS[index];
  const flipped = phase === "flipped";
  const leaving = phase === "leaving";

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <style>{styles}</style>

      {/* Card stage with perspective */}
      <div className="relative h-24" style={{ perspective: "1000px" }}>
        {/* Stacked next-card peeks behind for depth */}
        <div className="absolute inset-x-3 top-2 bottom-0 rounded-xl border border-border bg-card/50" />
        <div className="absolute inset-x-1.5 top-1 bottom-0 rounded-xl border border-border bg-card/70" />

        {/* Swipe layer (re-mounts per card → replays the spring-in) */}
        <div
          key={index}
          data-flashcard-swipe
          className="absolute inset-0"
          style={{
            animation: reduced
              ? undefined
              : leaving
                ? `flashcard-out ${LEAVE_MS}ms cubic-bezier(0.5,0,0.75,0.4) forwards`
                : "flashcard-in 760ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Flip layer */}
          <div
            className="relative h-full w-full"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 900ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Front (question) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-card p-3 text-center shadow-sm"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <span className="text-[0.55rem] font-semibold uppercase tracking-wide text-muted">
                Question
              </span>
              <p className="mt-1 text-[0.72rem] font-medium leading-snug text-foreground">
                {card.q}
              </p>
            </div>

            {/* Back (answer) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-primary/40 bg-card p-3 text-center shadow-md"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="text-[0.55rem] font-semibold uppercase tracking-wide text-primary">
                Answer
              </span>
              <p className="mt-1 text-[0.72rem] leading-snug text-foreground">
                {card.a}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="mt-3 flex justify-center gap-1">
        {CARDS.map((_, i) => (
          <span
            key={i}
            className={
              "h-1.5 rounded-full transition-all duration-300 " +
              (i === index ? "w-4 bg-primary" : "w-1.5 bg-border")
            }
          />
        ))}
      </div>
    </div>
  );
}

export default FlashcardsDemo;
