"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { GnosisAvatar } from "@/components/gnosis-avatar";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Animated Nosi tutor chat preview.
 *
 * Loops a scripted exchange: the user's question appears in full (animating in
 * fresh each cycle), Nosi pauses to "think" (animated dots), then its answer
 * streams in token by token. Under `prefers-reduced-motion` the full exchange
 * is shown statically with no looping.
 */
const QUESTION = "Explain the movements at the shoulder joint.";
const ANSWER =
  "The shoulder (glenohumeral) joint allows movement in several planes…";

// Tokenise on spaces, keeping the trailing space so the text reflows naturally.
function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

const ANSWER_TOKENS = tokenize(ANSWER);

type Phase = "user-in" | "thinking" | "typing-nosi" | "done";

const NOSI_TOKEN_MS = 110;
const USER_HOLD_MS = 800;
const THINKING_MS = 1300;
const HOLD_MS = 3500;

export function NosiChatDemo() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("user-in");
  const [nosiCount, setNosiCount] = useState(0);
  const [iteration, setIteration] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) {
      setPhase("done");
      setNosiCount(ANSWER_TOKENS.length);
      return;
    }

    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
    };

    if (phase === "user-in") {
      timer.current = setTimeout(() => setPhase("thinking"), USER_HOLD_MS);
    } else if (phase === "thinking") {
      timer.current = setTimeout(() => setPhase("typing-nosi"), THINKING_MS);
    } else if (phase === "typing-nosi") {
      if (nosiCount < ANSWER_TOKENS.length) {
        timer.current = setTimeout(() => setNosiCount((c) => c + 1), NOSI_TOKEN_MS);
      } else {
        timer.current = setTimeout(() => setPhase("done"), 200);
      }
    } else if (phase === "done") {
      // Hold the completed exchange, then restart a fresh loop.
      timer.current = setTimeout(() => {
        setNosiCount(0);
        setIteration((i) => i + 1);
        setPhase("user-in");
      }, HOLD_MS);
    }

    return clear;
  }, [phase, nosiCount, reduced]);

  const nosiVisible = phase === "thinking" || phase === "typing-nosi" || phase === "done";
  const nosiTyping = phase === "typing-nosi" && nosiCount < ANSWER_TOKENS.length;

  return (
    <div
      className="rounded-lg border border-border bg-surface p-3"
      aria-label={`Chat with Nosi. You: ${QUESTION} Nosi: ${ANSWER}`}
      role="img"
    >
      {/* User message — shown in full, re-animates in each loop */}
      <p
        key={iteration}
        aria-hidden="true"
        className={cn(
          "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-1.5 text-[0.7rem] leading-snug text-primary-foreground",
          !reduced && "duration-300 animate-in fade-in-0 slide-in-from-bottom-2",
        )}
      >
        {QUESTION}
      </p>

      {/* Nosi reply */}
      <div
        aria-hidden="true"
        className={cn(
          "mt-2.5 flex items-end gap-1.5 transition-all duration-300",
          nosiVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0",
        )}
      >
        <GnosisAvatar size={24} state={nosiTyping ? "speaking" : "idle"} />
        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-card px-3 py-1.5 text-[0.7rem] leading-snug text-foreground shadow-sm">
          {phase === "thinking" ? (
            <TypingDots />
          ) : (
            <>
              {ANSWER_TOKENS.slice(0, nosiCount).join("")}
              {nosiTyping ? <Caret /> : null}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/** Blinking text caret shown while a message streams. */
function Caret() {
  return (
    <span className="ml-0.5 inline-block h-3 w-px translate-y-0.5 animate-pulse bg-current align-middle" />
  );
}

/** Animated "…thinking" dots shown before Nosi answers. */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export default NosiChatDemo;
