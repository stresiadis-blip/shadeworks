"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LandingHero } from "./LandingHero";

/**
 * Landing experience (Vectr model, noir ShadeWorks). Composes the pinned hero
 * with the story body that slides up over it. Story sections (manifest, proof,
 * engine, process, CTA, footer) land in the following commits — for now the
 * body is an empty solid-ink block that already demonstrates the slide-over.
 *
 * Under reduced motion the hero is in normal flow, so the transparent dwell
 * window is skipped (it would otherwise trap the wheel over a static hero).
 */
export function LandingExperience() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="relative">
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
        {/* sections added in the next commits */}
        <div className="min-h-[100svh] bg-ink" />
      </div>
    </div>
  );
}
