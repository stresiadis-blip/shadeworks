"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { IdeaScannerConsole } from "@/components/gallery/IdeaScannerConsole";
import { HERO_TITLE_LINES, STORY_EYEBROW, STORY_BRIDGE } from "@/data/studio";

/**
 * Landing hero — the pinned, purely-typographic opener (Vectr model, noir
 * ShadeWorks). When motion is allowed the hero is `fixed inset-0` and the story
 * body below slides up over it (the proven ACT-1 pattern from StoryScroll, which
 * uses `fixed` rather than `sticky` to dodge the `overflow-x:hidden` body that
 * breaks sticky). Under reduced motion it falls back to a normal in-flow
 * section so the page scrolls natively with no trapped wheel.
 */
export function LandingHero({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-reveal]",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.25,
        }
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <>
      <section
        ref={rootRef}
        className={`flex flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center ${
          reduced ? "relative min-h-[100svh]" : "fixed inset-0 z-0"
        }`}
      >
        {/* subtle noir atmosphere — kept light here; heavier layers land in polish */}
        <div aria-hidden className="pointer-events-none absolute inset-0 noir-grain" />
        <div aria-hidden className="pointer-events-none absolute inset-0 noir-vignette" />

        <div className="relative mx-auto max-w-5xl">
          <p
            data-hero-reveal
            className="mb-8 font-mono text-[10px] uppercase tracking-[0.4em] text-signal"
          >
            {STORY_EYEBROW}
          </p>
          <h1 className="font-display-black text-4xl leading-[0.92] text-bone md:text-7xl lg:text-8xl">
            {HERO_TITLE_LINES.map((line) => (
              <span key={line} data-hero-reveal className="block">
                {line}
              </span>
            ))}
          </h1>
          <p
            data-hero-reveal
            className="mx-auto mt-10 max-w-xl font-mono text-xs leading-relaxed tracking-wide text-bone-muted md:text-sm"
          >
            {STORY_BRIDGE}
          </p>
          <button
            data-hero-reveal
            onClick={() => setConsoleOpen(true)}
            className="mt-12 bg-crimson px-10 py-5 font-mono text-xs uppercase tracking-[0.3em] text-bone transition-all hover:-translate-y-0.5 hover:bg-crimson-bright"
          >
            EXECUTE DESCENT
          </button>
        </div>

        {/* scroll cue */}
        {!reduced && (
          <div className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim">
              scroll
            </span>
            <span className="animate-scroll-cue block h-10 w-px bg-gradient-to-b from-bone/50 to-transparent" />
          </div>
        )}
      </section>

      {consoleOpen && <IdeaScannerConsole onClose={() => setConsoleOpen(false)} />}
    </>
  );
}
