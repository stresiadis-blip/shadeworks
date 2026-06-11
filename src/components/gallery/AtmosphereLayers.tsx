"use client";

import { useEffect, useRef } from "react";

/**
 * Noir atmosphere — DOM layers stacked in front of the Three.js sphere (z-0)
 * but behind the UI chrome (z-30). Back-to-front:
 *   fog (z-8) → halftone (z-10) → rain far+near (z-11) → vignette (z-12)
 *   → grain (z-13) → lightning (z-14)
 * All layers are pointer-events-none so drag/raycast pass straight through.
 *
 * Lightning is scheduled in JS (randomized 8–15s) by toggling .is-flash, and is
 * skipped entirely under prefers-reduced-motion. Rain/grain/fog animation is
 * disabled via CSS media query in that mode.
 */
export function AtmosphereLayers() {
  const boltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 8000 + Math.random() * 7000; // 8–15s
      timer = setTimeout(strike, delay);
    };
    const strike = () => {
      const el = boltRef.current;
      if (el) {
        el.classList.remove("is-flash");
        // force reflow so the animation restarts even on back-to-back strikes
        void el.offsetWidth;
        el.classList.add("is-flash");
        // occasional quick second bolt (real lightning stutters)
        if (Math.random() < 0.35) {
          setTimeout(() => {
            el.classList.remove("is-flash");
            void el.offsetWidth;
            el.classList.add("is-flash");
          }, 620);
        }
      }
      schedule();
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10" aria-hidden>
      {/* drifting volumetric fog (deepest) */}
      <div className="noir-fog absolute inset-0" />
      {/* comic halftone print, masked to fade at edges */}
      <div className="noir-halftone absolute inset-0" />
      {/* rain — far faint drizzle, then nearer streaks */}
      <div className="noir-rain-far absolute inset-0" />
      <div className="noir-rain absolute inset-0" />
      {/* heavy noir vignette */}
      <div className="noir-vignette absolute inset-0" />
      {/* projected-film grain */}
      <div className="noir-grain absolute inset-0" />
      {/* lightning flash (topmost, screen blend) */}
      <div ref={boltRef} className="noir-lightning absolute inset-0" />
    </div>
  );
}
