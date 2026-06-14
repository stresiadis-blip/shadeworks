"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LandingHero } from "./LandingHero";
import { ManifestSection } from "./ManifestSection";
import { EngineSection } from "./EngineSection";
import { ProofSection } from "./ProofSection";
import { ProcessSection } from "./ProcessSection";

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing experience — editorial scroll (Vectr structure): a pinned hero, then
 * the flowing sections that slide up over it, ending with the numbered process
 * that builds on scroll. All copy is byte-for-byte from studio.ts.
 *
 * Reveals are opt-in: any [data-reveal] (or [data-reveal-item] inside a
 * [data-reveal-group]) animates from a hidden state ONLY under no-preference.
 * Under reduced motion the hero is in normal flow, the transparent dwell window
 * is skipped, and every section renders its final state instantly.
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
      {/* clean fixed header — sits above the hero, transparent, reads over noir */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-logo text-2xl text-bone transition-opacity hover:opacity-80"
        >
          shadeworks
        </Link>
        <nav className="flex items-center gap-7">
          {[
            { label: "Work", href: "/work" },
            { label: "Studio", href: "#" },
            { label: "Contact", href: "#" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-bone-muted transition-colors hover:text-bone"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* pinned hero */}
      <LandingHero reduced={reduced} />

      {/* story body — solid ink slides up over the fixed hero */}
      <div className="relative z-10">
        {!reduced && (
          <div aria-hidden className="pointer-events-none h-[100svh] w-full" />
        )}
        <div className="bg-ink">
          <ManifestSection />
          <EngineSection />
          <ProofSection />
          <ProcessSection />
        </div>
      </div>
    </div>
  );
}
