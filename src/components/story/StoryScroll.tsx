"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IdeaScannerConsole } from "@/components/gallery/IdeaScannerConsole";
import { CATEGORY_LABELS } from "@/data/projects";
import {
  HERO_TITLE_LINES,
  STORY_EYEBROW,
  STORY_BRIDGE,
  MANIFEST_EYEBROW,
  MANIFEST_HEADLINE,
  MANIFEST_BODY,
  CATEGORY_BLURBS,
  PROOF_EYEBROW,
  PROOF_HEADLINE,
  ENGINE_EYEBROW,
  ENGINE_HEADLINE,
  ENGINE_BODY,
  ENGINE_AGENTS,
  OPERATOR_EYEBROW,
  OPERATOR_HEADLINE,
  OPERATOR_BODY,
  OPERATOR_STEPS,
  CTA_EYEBROW,
  CTA_HEADLINE,
  CTA_HEADLINE_2,
} from "@/data/studio";

gsap.registerPlugin(ScrollTrigger);

/**
 * ACT 2 — the scroll story. Sits as a later DOM sibling of the fixed
 * GalleryExperience (ACT 1): a `position: fixed` element forms its own stacking
 * context, so this whole block paints above the gallery. The story opens with a
 * transparent 100svh spacer (pointer-events-none) through which the sphere stays
 * visible AND interactive; the solid story sections then slide up over it.
 *
 * All scroll motion is opt-in: every element renders at its FINAL state by
 * default, and GSAP only animates FROM a hidden state when the user has no
 * reduced-motion preference. Scrub effects are desktop-only (lg+).
 */
export function StoryScroll() {
  const rootRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  // all steps lit by default → correct for SSR, mobile, and reduced motion
  const [activeSteps, setActiveSteps] = useState<number[]>(() =>
    OPERATOR_STEPS.map((_, i) => i)
  );

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    // ── reveals: any motion-OK viewport ──────────────────────────────────────
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

    // ── desktop-only scrub: the process timeline draws as you pass it ─────────
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
      const line = lineRef.current;
      const section = processRef.current;
      if (line && section) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 60%", end: "bottom 80%", scrub: true },
          }
        );
      }

      // dim all, then light each step as it reaches center
      setActiveSteps([]);
      OPERATOR_STEPS.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: stepRefs.current[i],
          start: "top 62%",
          onEnter: () => setActiveSteps((s) => (s.includes(i) ? s : [...s, i])),
          onLeaveBack: () => setActiveSteps((s) => s.filter((x) => x !== i)),
        });
      });

      return () => setActiveSteps(OPERATOR_STEPS.map((_, i) => i));
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative z-10">
      {/* ACT-1 reveal window — transparent, lets the fixed sphere show through.
          Skipped under reduced motion (the fallback grid is scrollable, so a
          transparent overlay would trap the wheel); the story then opens at the
          top and the static grid simply sits behind it. */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none relative h-[100svh] w-full">
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-muted">
              scroll
            </span>
            <span className="animate-scroll-cue block h-10 w-px bg-gradient-to-b from-bone/50 to-transparent" />
          </div>
        </div>
      )}

      {/* ACT 2 — story body. Solid ink so it covers ACT 1 as it slides up. */}
      <div className="relative bg-ink">
        {/* ── S1 — THE DESCENT ────────────────────────────────────────────── */}
        <section className="border-t border-bone/10 px-6 py-28 md:py-40">
          <div className="mx-auto max-w-5xl">
            <p
              data-reveal
              className="font-mono text-[10px] uppercase tracking-[0.4em] text-signal mb-10"
            >
              {STORY_EYEBROW}
            </p>
            <h2 className="font-display-black text-bone text-4xl md:text-7xl leading-[0.95]">
              {HERO_TITLE_LINES.map((line) => (
                <span key={line} data-reveal className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p
              data-reveal
              className="font-mono text-xs md:text-sm text-bone-muted max-w-xl mt-10 leading-relaxed tracking-wide"
            >
              {STORY_BRIDGE}
            </p>
          </div>
        </section>

        {/* ── S2 — MANIFEST / THREE TRACKS ────────────────────────────────── */}
        <section className="border-t border-bone/10 px-6 py-28 md:py-40">
          <div className="mx-auto max-w-5xl">
            <p
              data-reveal
              className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim mb-6"
            >
              {MANIFEST_EYEBROW}
            </p>
            <h2
              data-reveal
              className="font-display-black text-bone text-3xl md:text-6xl mb-6"
            >
              {MANIFEST_HEADLINE}
            </h2>
            <p
              data-reveal
              className="font-mono text-xs md:text-sm text-bone-muted max-w-2xl leading-relaxed mb-16"
            >
              {MANIFEST_BODY}
            </p>

            <div data-reveal-group className="flex flex-col">
              {CATEGORY_BLURBS.map(({ category, blurb }, i) => (
                <div
                  key={category}
                  data-reveal-item
                  className="group relative flex flex-col gap-2 border-t border-bone/10 py-8 last:border-b md:flex-row md:items-baseline md:gap-10"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-0 -top-2 font-display-black text-7xl md:text-8xl text-bone/[0.04] select-none"
                  >
                    0{i + 1}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.3em] text-crimson shrink-0 md:w-16">
                    0{i + 1}
                  </span>
                  <span className="font-display-black text-bone text-xl md:text-2xl md:w-80 shrink-0">
                    {CATEGORY_LABELS[category].replace(/^\d+\s*\/\/\s*/, "")}
                  </span>
                  <span className="font-mono text-xs text-bone-muted leading-relaxed max-w-md">
                    {blurb}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── S3 — PROOF / FERDIPOKER ─────────────────────────────────────── */}
        <section className="border-t border-bone/10 px-6 py-28 md:py-40">
          <div className="mx-auto max-w-5xl">
            <p
              data-reveal
              className="font-mono text-[10px] uppercase tracking-[0.4em] text-signal mb-6"
            >
              {PROOF_EYEBROW}
            </p>
            <h2
              data-reveal
              className="font-display-black text-bone text-3xl md:text-6xl mb-12"
            >
              {PROOF_HEADLINE}
            </h2>

            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <Link
                href="/work/ferdipoker"
                data-reveal
                className="group relative block overflow-hidden border border-bone/15 transition-colors hover:border-crimson"
              >
                <div className="relative aspect-[16/10] w-full bg-ink-elevated">
                  <Image
                    src="/work/ferdipoker.jpg"
                    alt="FerdiPoker — live MTT poker training platform"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-4 top-4 bg-crimson px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-bone">
                    LIVE
                  </span>
                </div>
              </Link>

              <div data-reveal-group className="flex flex-col gap-6">
                <h3
                  data-reveal-item
                  className="font-display-black text-bone text-2xl md:text-4xl"
                >
                  FERDIPOKER
                </h3>
                <p data-reveal-item className="font-mono text-xs text-bone-muted leading-relaxed">
                  MTT poker training platform — Stripe subscriptions, member video
                  library, Discord-linked community.
                </p>
                <div data-reveal-item className="flex flex-wrap gap-px">
                  {[
                    ["LIVE", "ON FERDIPOKER.RO"],
                    ["STRIPE", "REAL RECURRING PAYMENTS"],
                    ["0", "TEMPLATES — BUILT FROM NOTHING"],
                  ].map(([n, label]) => (
                    <div
                      key={label}
                      className="flex min-w-[9rem] flex-1 flex-col gap-1 border border-bone/10 bg-ink-elevated p-4"
                    >
                      <span className="font-display-black text-crimson text-2xl">{n}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-bone-dim">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  data-reveal-item
                  href="/work/ferdipoker"
                  className="self-start font-mono text-[11px] uppercase tracking-[0.25em] border border-bone/20 px-6 py-3 text-bone transition-colors hover:border-crimson hover:text-crimson"
                >
                  VIEW CASE STUDY &gt;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── S4 — THE ENGINE ─────────────────────────────────────────────── */}
        <section className="border-t border-bone/10 px-6 py-28 md:py-40">
          <div className="mx-auto max-w-5xl">
            <p
              data-reveal
              className="font-mono text-[10px] uppercase tracking-[0.4em] text-signal mb-6"
            >
              {ENGINE_EYEBROW}
            </p>
            <h2
              data-reveal
              className="font-display-black text-bone text-3xl md:text-5xl mb-8"
            >
              {ENGINE_HEADLINE}
            </h2>
            <p
              data-reveal
              className="font-mono text-sm text-bone-muted leading-relaxed mb-12 max-w-3xl"
            >
              {ENGINE_BODY}
            </p>

            <div data-reveal-group className="space-y-px">
              {ENGINE_AGENTS.map((a, i) => (
                <div
                  key={a.name}
                  data-reveal-item
                  className="flex flex-col gap-2 border-t border-bone/10 py-6 last:border-b md:flex-row md:items-center md:gap-8"
                >
                  <span className="font-mono text-[10px] text-crimson w-8">0{i + 1}</span>
                  <span className="font-display-black text-bone text-lg md:w-64 shrink-0">
                    <span className="text-crimson mr-2">&#9656;</span>
                    {a.name}
                  </span>
                  <span className="font-mono text-xs text-bone-muted leading-relaxed">
                    {a.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── S5 — OPERATORS / PROCESS ────────────────────────────────────── */}
        <section ref={processRef} className="border-t border-bone/10 px-6 py-28 md:py-40">
          <div className="mx-auto max-w-5xl">
            <p
              data-reveal
              className="font-mono text-[10px] uppercase tracking-[0.4em] text-signal mb-6"
            >
              {OPERATOR_EYEBROW}
            </p>
            <h2
              data-reveal
              className="font-display-black text-bone text-3xl md:text-5xl mb-8"
            >
              {OPERATOR_HEADLINE}
            </h2>
            <p
              data-reveal
              className="font-mono text-sm text-bone-muted leading-relaxed mb-16 max-w-3xl"
            >
              {OPERATOR_BODY}
            </p>

            {/* timeline: vertical rail (scrub-drawn on desktop) + steps */}
            <div className="relative pl-10 md:pl-16">
              <span
                aria-hidden
                className="absolute left-[7px] top-2 bottom-2 w-px bg-bone/10 md:left-[15px]"
              />
              <span
                ref={lineRef}
                aria-hidden
                style={{ transformOrigin: "top" }}
                className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-crimson to-signal md:left-[15px]"
              />
              <div className="flex flex-col gap-8">
                {OPERATOR_STEPS.map((s, i) => {
                  const on = activeSteps.includes(i);
                  return (
                    <div
                      key={s.step}
                      ref={(el) => {
                        stepRefs.current[i] = el;
                      }}
                      className="relative"
                    >
                      <span
                        aria-hidden
                        className={`absolute -left-10 top-1 h-4 w-4 rounded-full border-2 transition-colors duration-500 md:-left-16 ${
                          on ? "border-crimson bg-crimson" : "border-bone/30 bg-ink"
                        }`}
                      />
                      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-8">
                        <span className="font-mono text-sm font-bold text-crimson w-20 shrink-0">
                          {s.step}
                        </span>
                        <span
                          className={`font-display-black text-lg md:w-72 shrink-0 transition-colors duration-500 ${
                            on ? "text-bone" : "text-bone-muted"
                          }`}
                        >
                          {s.title}
                        </span>
                        <span className="font-mono text-xs text-bone-muted leading-relaxed">
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── S6 — CTA / EXECUTE DESCENT ──────────────────────────────────── */}
        <section className="border-t border-bone/10 px-6 py-32 md:py-48">
          <div className="mx-auto max-w-5xl text-center">
            <p
              data-reveal
              className="font-mono text-[10px] uppercase tracking-[0.4em] text-signal mb-8"
            >
              {CTA_EYEBROW}
            </p>
            <h2
              data-reveal
              className="font-display-black text-bone text-4xl md:text-7xl leading-[0.95] mb-12"
            >
              {CTA_HEADLINE}
              <br />
              {CTA_HEADLINE_2}
            </h2>
            <button
              data-reveal
              onClick={() => setConsoleOpen(true)}
              className="font-mono text-xs uppercase tracking-[0.3em] px-10 py-5 bg-crimson text-bone transition-all hover:bg-crimson-bright hover:-translate-y-0.5"
            >
              EXECUTE DESCENT
            </button>
            <p
              data-reveal
              className="font-mono text-[11px] text-bone-dim max-w-xl mx-auto mt-10 leading-relaxed"
            >
              {OPERATOR_BODY}
            </p>
          </div>
        </section>
      </div>

      {consoleOpen && <IdeaScannerConsole onClose={() => setConsoleOpen(false)} />}
    </div>
  );
}
