"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LandingHero } from "./LandingHero";
import { JourneySection } from "./JourneySection";
import { ManifestSection } from "./ManifestSection";
import { ProofSection } from "./ProofSection";
import { EngineSection } from "./EngineSection";

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing experience (Vectr model, noir ShadeWorks). Composes the pinned hero
 * with the story body that slides up over it, and drives the scroll reveals for
 * every section below.
 *
 * Reveals are opt-in: any element with [data-reveal] (or [data-reveal-item]
 * inside a [data-reveal-group]) animates from a hidden state ONLY under
 * no-preference. Under reduced motion the hero is in normal flow, the
 * transparent dwell window is skipped, and every section renders its final
 * state instantly.
 */
export function LandingExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]", root).forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 42,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]", root).forEach((group) => {
        const items = group.querySelectorAll("[data-reveal-item]");
        gsap.from(items, {
          opacity: 0,
          y: 32,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: group, start: "top 78%", once: true },
        });
      });

      ScrollTrigger.refresh();
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* brand mark — persists across sections */}
      <Link
        href="/"
        className="fixed left-6 top-6 z-40 font-logo text-2xl text-bone mix-blend-difference transition-opacity hover:opacity-80"
      >
        shadeworks
      </Link>

      <LandingHero reduced={reduced} />

      {/* story body — solid ink slides up over the fixed hero */}
      <div className="relative z-10">
        {!reduced && (
          <div aria-hidden className="pointer-events-none h-[100svh] w-full" />
        )}
        <div className="bg-ink">
          <JourneySection />
          <ManifestSection />
          <ProofSection />
          <EngineSection />
          {/* sections added in the next commits */}
        </div>
      </div>
    </div>
  );
}
