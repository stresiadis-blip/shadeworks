"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JourneyCanvas } from "./journey/JourneyCanvas";
import { JourneyProcess } from "./journey/JourneyProcess";
import { setJourneyProgress } from "./journey/journeyStore";
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

const SCRIM_BG =
  "linear-gradient(180deg, rgba(8,9,13,0.9) 0%, rgba(8,9,13,0.18) 28%, rgba(8,9,13,0.18) 72%, rgba(8,9,13,0.9) 100%)";

/**
 * Landing experience — the Vectr editorial structure over a single cinematic
 * canvas backdrop (JourneyCanvas). One 300vh ScrollTrigger pin (scrub, on top of
 * Lenis) writes a valtio store; the canvas reads it imperatively, the hero fades,
 * the six-step process opens step by step, and a scrim keeps text legible over
 * the bright climax. After the pin, Proof + CTA flow on solid ink. All copy is
 * byte-for-byte from studio.ts. Reduced motion = a static readable page with the
 * canvas held at progress 0.66.
 */
export function LandingExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLElement>(null);
  const pinInnerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // The pinned scroll timeline: drives the store (car/fog/dawn/colour/step) and
  // the DOM fades. Skipped entirely under reduced motion (static frame instead).
  useEffect(() => {
    const section = pinSectionRef.current;
    const inner = pinInnerRef.current;
    if (!section || !inner) return;

    if (reduced) {
      setJourneyProgress(0.66);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          pin: inner,
          pinSpacing: false,
          onUpdate: (self) => setJourneyProgress(self.progress),
        },
      });
      tl.to(heroRef.current, { opacity: 0, y: -40, duration: 0.16 }, 0)
        .fromTo(
          processRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.08 },
          0.12,
        )
        .fromTo(fillRef.current, { scaleY: 0 }, { scaleY: 1, duration: 0.8 }, 0.16)
        .fromTo(scrimRef.current, { opacity: 0.22 }, { opacity: 0.5, duration: 1 }, 0);
      ScrollTrigger.refresh();
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  // Proof + CTA reveals (only under no-preference).
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
    });
    return () => mm.revert();
  }, []);

  const heroBlock = (
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
  );

  return (
    <div ref={rootRef} className="relative overflow-x-hidden">
      {/* cinematic canvas backdrop — fixed behind everything */}
      <JourneyCanvas reduced={reduced} />

      {/* legibility scrim between the scene and the text */}
      <div
        ref={scrimRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{ background: SCRIM_BG, opacity: reduced ? 0.42 : 0.22 }}
      />

      {/* clean fixed header */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-logo text-2xl text-bone transition-opacity hover:opacity-80">
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

      {/* content above the backdrop */}
      <div className="relative z-10">
        {reduced ? (
          // static, fully readable: hero then the expanded process
          <section className="relative">
            <div className="flex min-h-[100svh] flex-col justify-center px-6">{heroBlock}</div>
            <div className="py-24">
              <JourneyProcess fillRef={fillRef} reduced />
            </div>
          </section>
        ) : (
          // pinned journey: hero cross-fades into the stepping process
          <section ref={pinSectionRef} className="relative h-[300vh]">
            <div ref={pinInnerRef} className="relative flex h-screen w-full items-center overflow-hidden">
              <div ref={heroRef} className="absolute inset-0 flex flex-col justify-center px-6">
                {heroBlock}
                <div className="pointer-events-none absolute inset-x-0 bottom-10">
                  <div className="mx-auto flex max-w-5xl items-center gap-4 px-6">
                    <span className="animate-scroll-cue block h-10 w-px bg-gradient-to-b from-bone/50 to-transparent" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim">
                      SCROLL TO DISCOVER
                    </span>
                  </div>
                </div>
              </div>
              <div ref={processRef} className="absolute inset-0 flex items-center opacity-0">
                <JourneyProcess fillRef={fillRef} reduced={false} />
              </div>
            </div>
          </section>
        )}

        {/* after the pin — solid ink, normal flow */}
        <div className="bg-ink">
          <ProofSection />

          <section className="border-t border-bone/10 bg-ink px-6 py-28 text-center md:py-40">
            <p data-reveal className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim">
              {CTA_EYEBROW}
            </p>
            <h2 data-reveal className="font-display-black text-4xl leading-[0.95] text-bone md:text-7xl">
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

      {consoleOpen && <IdeaScannerConsole onClose={() => setConsoleOpen(false)} />}
    </div>
  );
}
