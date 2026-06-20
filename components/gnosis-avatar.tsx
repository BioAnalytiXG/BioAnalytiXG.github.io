"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Nosi — the animated GnosisAI tutor mascot.
 *
 * Faithful React port of the app's `GnosisAvatar.vue`: a glossy teal squircle
 * whose eyes blink at natural intervals and glance around while idle, with a
 * gentle float. Pure SVG + CSS, colors hardcoded to the app's light-theme teal
 * (`#4C8A99` / `#5B9CA7`) so it matches the real product. Honors
 * `prefers-reduced-motion`.
 */
export interface GnosisAvatarProps {
  state?: "idle" | "thinking" | "speaking";
  size?: number;
}

const css = `
.gnosis-buddy { position: relative; display: inline-flex; flex-shrink: 0; line-height: 0; }
.gnosis-buddy .body { width: 100%; height: 100%; display: block; transform-origin: 50% 60%; filter: drop-shadow(0 2px 5px rgba(76,138,153,0.35)); }
.gnosis-buddy .pupil, .gnosis-buddy .glint { transition: cx 0.35s ease, cy 0.35s ease, opacity 0.1s ease; }
.gnosis-buddy .lid { transition: ry 0.12s ease; }
.gnosis-buddy .smile-eyes { opacity: 0; transition: opacity 0.2s ease; }
.gnosis-buddy.is-speaking .smile-eyes { opacity: 1; }
.gnosis-buddy.is-speaking .lid, .gnosis-buddy.is-speaking .pupil, .gnosis-buddy.is-speaking .glint { opacity: 0 !important; }
.gnosis-buddy.is-idle .body { animation: gnosis-buddy-float 4s ease-in-out infinite; }
.gnosis-buddy.is-thinking .body { animation: gnosis-buddy-think 2.6s ease-in-out infinite; }
.gnosis-buddy.is-speaking .body { animation: gnosis-buddy-bob 1.5s ease-in-out infinite; }
@keyframes gnosis-buddy-float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-2px) scale(1.02); } }
@keyframes gnosis-buddy-bob { 0%,100% { transform: translateY(0) rotate(0deg); } 30% { transform: translateY(-1.5px) rotate(-2.5deg); } 70% { transform: translateY(0.5px) rotate(2.5deg); } }
@keyframes gnosis-buddy-think { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@media (prefers-reduced-motion: reduce) { .gnosis-buddy .body, .gnosis-buddy .pupil, .gnosis-buddy .glint { animation: none !important; } }
`;

export function GnosisAvatar({ state = "idle", size = 40 }: GnosisAvatarProps) {
  const [blinking, setBlinking] = useState(false);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let blinkInner: ReturnType<typeof setTimeout>;
    let gazeTimer: ReturnType<typeof setTimeout>;
    let gazeInner: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        setBlinking(true);
        blinkInner = setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 140);
      }, 2400 + Math.random() * 3400);
    };

    const scheduleGaze = () => {
      gazeTimer = setTimeout(() => {
        if (stateRef.current !== "thinking") {
          const angle = Math.random() * Math.PI * 2;
          const r = 3 + Math.random() * 2;
          setGaze({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
          gazeInner = setTimeout(() => setGaze({ x: 0, y: 0 }), 900);
        }
        scheduleGaze();
      }, 1800 + Math.random() * 2600);
    };

    scheduleBlink();
    scheduleGaze();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(blinkInner);
      clearTimeout(gazeTimer);
      clearTimeout(gazeInner);
    };
  }, []);

  const eyeRy = blinking ? 0.8 : 9;
  const pupil = state === "thinking" ? { x: 0, y: -3 } : gaze;

  return (
    <div
      className={`gnosis-buddy is-${state}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Nosi tutor"
    >
      <style>{css}</style>
      <svg className="body" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gnosis-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B9CA7" />
            <stop offset="100%" stopColor="#4C8A99" />
          </linearGradient>
        </defs>

        <rect className="shell" x="6" y="6" width="88" height="88" rx="30" ry="30" fill="url(#gnosis-body)" />
        <rect x="16" y="13" width="68" height="34" rx="17" fill="rgba(255,255,255,0.18)" />

        <g className="eyes">
          <g className="eye">
            <ellipse className="lid" cx="37" cy="52" rx="9" ry={eyeRy} fill="#FDFAFD" />
            <circle className="pupil" cx={37 + pupil.x} cy={52 + pupil.y} r="4.2" fill="#10303A" opacity={blinking ? 0 : 1} />
            <circle className="glint" cx={38.6 + pupil.x} cy={50.4 + pupil.y} r="1.4" fill="#FFFFFF" opacity={blinking ? 0 : 0.95} />
          </g>
          <g className="eye">
            <ellipse className="lid" cx="63" cy="52" rx="9" ry={eyeRy} fill="#FDFAFD" />
            <circle className="pupil" cx={63 + pupil.x} cy={52 + pupil.y} r="4.2" fill="#10303A" opacity={blinking ? 0 : 1} />
            <circle className="glint" cx={64.6 + pupil.x} cy={50.4 + pupil.y} r="1.4" fill="#FFFFFF" opacity={blinking ? 0 : 0.95} />
          </g>

          <g className="smile-eyes" stroke="#10303A" strokeWidth="3.4" strokeLinecap="round" fill="none">
            <path d="M29 54 Q37 46 45 54" />
            <path d="M55 54 Q63 46 71 54" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default GnosisAvatar;
