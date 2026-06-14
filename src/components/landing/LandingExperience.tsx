"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IsoDiorama } from "./IsoDiorama";
import { ProcessSection, PROCESS_STEPS } from "./ProcessSection";
import { ManifestSection } from "./ManifestSection";
import { ProofSection } from "./ProofSection";
import { IdeaScannerConsole } from "@/components/gallery/IdeaScannerConsole";
import {
  STORY_EYEBROW,
  HERO_TITLE_LINES,
  STORY_BRIDGE,
  CTA_EYEBROW,
  CTA_HEADLINE,
  CTA_HEADLINE_2,
} from "@/data/studio";

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing experience — editorial scroll over an ambient isometric diorama:
 *   1. iso diorama (fixed, parallax, re-focuses per process step)
 *   2. transparent hero (eyebrow + 2-line display title + subcopy + scroll cue)
 *   3. pinned, scroll-scrubbed numbered process (active step expands)
 *   4. editorial flow (manifest, proof) + CTA
 * All copy is byte-for-byte from studio.ts; colours are the noir tokens only.
 * Reveals + the per-step focus run only under no-preference; reduced motion
 * gives a static, readable page.
 */
export function LandingExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [consoleOpen, setConsoleOpen] = useState(false);

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
      {/* ambient iso diorama — fixed behind everything */}
      <IsoDiorama
        activeStep={activeStep}
        stepCount={PROCESS_STEPS.length}
        reduced={reduced}
      />

      {/* clean fixed header */}
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

      {/* content sits above the diorama */}
      <div className="relative z-10">
        {/* hero — transparent, the diorama shows through */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
          <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.4em] text-signal">
            {STORY_EYEBROW}
          </p>
          <h1 className="font-display-black text-5xl leading-[0.9] text-bone md:text-7xl lg:text-8xl">
            {HERO_TITLE_LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-10 max-w-xl font-mono text-xs leading-relaxed tracking-wide text-bone-muted md:text-sm">
            {STORY_BRIDGE}
          </p>
          {!reduced && (
            <div className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim">
                SCROLL TO DISCOVER
              </span>
              <span className="animate-scroll-cue block h-10 w-px bg-gradient-to-b from-bone/50 to-transparent" />
            </div>
          )}
        </section>

        {/* pinned, scroll-scrubbed process */}
        <ProcessSection reduced={reduced} onActive={setActiveStep} />

        {/* editorial flow — solid ink covers the diorama from here down */}
        <div className="bg-ink">
          <ManifestSection />
          <ProofSection />

          {/* CTA */}
          <section className="border-t border-bone/10 bg-ink px-6 py-28 text-center md:py-40">
            <p
              data-reveal
              className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim"
            >
              {CTA_EYEBROW}
            </p>
            <h2
              data-reveal
              className="font-display-black text-4xl leading-[0.95] text-bone md:text-7xl"
            >
              {CTA_HEADLINE}
              <span className="block text-crimson">{CTA_HEADLINE_2}</span>
            </h2>
            <button
              data-reveal
              type="button"
              onClick={() => setConsoleOpen(true)}
              className="mt-12 bg-crimson px-10 py-5 font-mono text-xs uppercase tracking-[0.3em] text-bone transition-all hover:-translate-y-0.5 hover:bg-crimson-bright"
            >
              BRING THE WEIGHT
            </button>
          </section>
        </div>
      </div>

      {consoleOpen && (
        <IdeaScannerConsole onClose={() => setConsoleOpen(false)} />
      )}
    </div>
  );
}
