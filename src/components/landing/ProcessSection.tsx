"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ENGINE_EYEBROW,
  ENGINE_HEADLINE,
  ENGINE_BODY,
  ENGINE_AGENTS,
  OPERATOR_STEPS,
} from "@/data/studio";

gsap.registerPlugin(ScrollTrigger);

interface ProcessStep {
  title: string;
  desc: string;
}

/** Numbered process content, byte-for-byte from studio.ts (ENGINE + OPERATOR). */
export const PROCESS_STEPS: ProcessStep[] = [
  ...ENGINE_AGENTS.map((a) => ({ title: a.name, desc: a.desc })),
  ...OPERATOR_STEPS.map((s) => ({ title: s.title, desc: s.desc })),
];

/**
 * The process — pinned and scroll-scrubbed. As you scroll, the pinned panel
 * stays put while the ACTIVE step expands (number + title + paragraph) and the
 * others collapse to number + title; a vertical line fills, and the active index
 * is reported up so the iso diorama re-focuses per step. Under reduced motion
 * the section is a normal, fully-expanded list (no pin, no scrub).
 */
export function ProcessSection({
  reduced,
  onActive,
}: {
  reduced: boolean;
  onActive: (i: number) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const fill = fillRef.current;
    if (!section || !pin || !fill) return;
    const n = PROCESS_STEPS.length;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      section.style.height = `${n * 60 + 80}svh`;
      gsap.set(fill, { scaleY: 0, transformOrigin: "top" });
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        pin: pin,
        pinSpacing: false,
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress });
          const i = Math.max(0, Math.min(n - 1, Math.floor(self.progress * n - 1e-4)));
          setActive(i);
          onActive(i);
        },
      });
      return () => st.kill();
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      section.style.height = "auto";
      gsap.set(fill, { scaleY: 1, transformOrigin: "top" });
      setActive(0);
      onActive(0);
    });

    return () => mm.revert();
  }, [onActive]);

  return (
    <section ref={sectionRef} className="relative">
      <div ref={pinRef} className="relative flex min-h-[100svh] w-full items-center">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          {/* intro — ENGINE copy */}
          <div className="md:sticky md:top-28 md:self-start">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim">
              {ENGINE_EYEBROW}
            </p>
            <h2 className="mb-6 font-display-black text-3xl leading-[0.95] text-bone md:text-5xl">
              {ENGINE_HEADLINE}
            </h2>
            <p className="max-w-md font-mono text-xs leading-relaxed text-bone-muted md:text-sm">
              {ENGINE_BODY}
            </p>
          </div>

          {/* numbered accordion with a building line */}
          <div className="relative pl-14">
            <span
              aria-hidden
              className="absolute left-[18px] top-2 bottom-2 w-px bg-bone/10"
            />
            <span
              ref={fillRef}
              aria-hidden
              className="absolute left-[18px] top-2 bottom-2 w-px bg-crimson"
            />
            <ol className="flex flex-col gap-6">
              {PROCESS_STEPS.map((s, i) => {
                const on = reduced || i === active;
                return (
                  <li key={s.title} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-14 top-0 flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[10px] tracking-[0.05em] transition-colors duration-300 ${
                        on
                          ? "border-crimson bg-ink text-crimson"
                          : "border-bone/20 bg-ink text-bone-dim"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <h3
                      className={`font-display-black text-lg leading-tight transition-colors duration-300 md:text-2xl ${
                        on ? "text-bone" : "text-bone-dim"
                      }`}
                    >
                      {s.title}
                    </h3>
                    {/* desc collapses via a 1fr/0fr grid row */}
                    <div
                      className="grid transition-all duration-500 ease-out"
                      style={{
                        gridTemplateRows: on ? "1fr" : "0fr",
                        opacity: on ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p className="pt-3 font-mono text-xs leading-relaxed text-bone-muted md:text-sm">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
