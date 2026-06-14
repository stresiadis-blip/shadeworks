"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JourneyBackdrop } from "./JourneyBackdrop";
import { ProcessSection } from "./ProcessSection";
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
 * Landing experience — editorial scroll over the car-journey background:
 *   1. car-journey scene (fixed, global-scroll-driven, noir -> sunrise)
 *   2. transparent hero (eyebrow + 2-line display title + subcopy + scroll cue)
 *   3. pinned, scroll-scrubbed numbered process (active step expands)
 *   4. editorial flow (manifest, proof) + CTA
 * The scene spans the whole scroll so its colour arc maps across the journey;
 * a scrim under the hero/process keeps text readable as the scene brightens.
 * All copy is byte-for-byte from studio.ts; text colours are the noir tokens
 * only. Reduced motion gives a static frame + a readable page.
 */
export function LandingExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const onBgProgress = useCallback((p: number) => setBgProgress(p), []);

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

  // The backdrop stays neo-noir (dark) the whole way, so a light scrim keeps
  // bone/crimson text legible; it ramps gently as the dawn glow bleeds in near
  // the horizon. Edges (eyebrow/cue/labels) get a touch more than the centre,
  // so the scene still reads through.
  const veil = 0.14 + bgProgress * 0.24;

  return (
    <div ref={rootRef} className="relative">
      {/* cinematic noir car-approach backdrop — fixed, scroll-driven over hero */}
      <JourneyBackdrop reduced={reduced} onProgress={onBgProgress} />

      {/* legibility scrim between the scene and the content */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `linear-gradient(180deg, rgba(10,10,10,${veil}) 0%, rgba(10,10,10,${veil * 0.55}) 24%, rgba(10,10,10,${veil * 0.5}) 76%, rgba(10,10,10,${veil}) 100%)`,
        }}
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
        {/* hero — transparent, editorial left rail, the diorama shows through */}
        <section className="relative flex min-h-[100svh] flex-col justify-center px-6">
          <div className="mx-auto w-full max-w-5xl">
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.4em] text-signal">
              {STORY_EYEBROW}
            </p>
            <h1 className="font-display-black text-6xl leading-[0.85] text-bone md:text-8xl lg:text-9xl">
              {HERO_TITLE_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-10 max-w-md font-mono text-xs leading-relaxed tracking-wide text-bone-muted md:text-sm">
              {STORY_BRIDGE}
            </p>
          </div>
          {!reduced && (
            <div className="pointer-events-none absolute inset-x-0 bottom-10">
              <div className="mx-auto flex max-w-5xl items-center gap-4 px-6">
                <span className="animate-scroll-cue block h-10 w-px bg-gradient-to-b from-bone/50 to-transparent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim">
                  SCROLL TO DISCOVER
                </span>
              </div>
            </div>
          )}
        </section>

        {/* pinned, scroll-scrubbed process (unchanged Vectr structure) */}
        <ProcessSection reduced={reduced} onActive={() => {}} />

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
