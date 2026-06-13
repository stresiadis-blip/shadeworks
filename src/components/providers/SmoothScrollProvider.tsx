"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth-scroll shell for the homepage. Drives Lenis off the GSAP ticker and
 * keeps ScrollTrigger in sync so the ACT-2 reveals track the smoothed scroll
 * position exactly.
 *
 * Under prefers-reduced-motion we skip Lenis entirely (native scroll, no
 * inertia) — the story still renders its final state via StoryScroll's own
 * reduced-motion branch.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // measure triggers once the first layout has settled
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  return <>{children}</>;
}
