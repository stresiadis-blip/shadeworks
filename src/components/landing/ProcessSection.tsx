"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IdeaScannerConsole } from "@/components/gallery/IdeaScannerConsole";
import {
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
 * The numbered process that BUILDS on scroll (Vectr "process" model). A vertical
 * line fills top->bottom as the section scrolls, lighting each numbered step as
 * it passes — then a final CTA. Copy is byte-for-byte from studio.ts; colours
 * and background reuse the existing tokens (ink / bone / crimson). Under reduced
 * motion the line is full and every step is active (static, readable, no scrub).
 */
export function ProcessSection() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0); // how many steps are lit (0..N)
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    const root = stepsRef.current;
    const fill = fillRef.current;
    if (!root || !fill) return;
    const n = OPERATOR_STEPS.length;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(fill, { scaleY: 0, transformOrigin: "top" });
      const st = ScrollTrigger.create({
        trigger: root,
        start: "top 75%",
        end: "bottom 85%",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress });
          setActive(Math.round(self.progress * n));
        },
      });
      return () => st.kill();
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Static readable state — line full, every step lit, no scrub.
      gsap.set(fill, { scaleY: 1, transformOrigin: "top" });
      setActive(n);
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="border-t border-bone/10 bg-ink px-6 py-28 md:py-40">
      <div className="mx-auto max-w-5xl">
        <p
          data-reveal
          className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim"
        >
          {OPERATOR_EYEBROW}
        </p>
        <h2
          data-reveal
          className="mb-6 font-display-black text-3xl text-bone md:text-5xl"
        >
          {OPERATOR_HEADLINE}
        </h2>
        <p
          data-reveal
          className="mb-16 max-w-2xl font-mono text-xs leading-relaxed text-bone-muted md:text-sm"
        >
          {OPERATOR_BODY}
        </p>

        {/* numbered process that builds on scroll */}
        <div ref={stepsRef} className="relative pl-14">
          {/* track + building fill, aligned with the number badges */}
          <span
            aria-hidden
            className="absolute left-[18px] top-3 bottom-3 w-px bg-bone/10"
          />
          <span
            ref={fillRef}
            aria-hidden
            className="absolute left-[18px] top-3 bottom-3 w-px bg-crimson"
          />

          <ol className="flex flex-col gap-14">
            {OPERATOR_STEPS.map((s, i) => {
              const on = i < active;
              return (
                <li
                  key={s.step}
                  className="relative transition-opacity duration-500"
                  style={{ opacity: on ? 1 : 0.3 }}
                >
                  <span
                    aria-hidden
                    className={`absolute -left-14 top-0 flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[10px] tracking-[0.1em] transition-colors duration-500 ${
                      on
                        ? "border-crimson bg-ink text-crimson"
                        : "border-bone/20 bg-ink text-bone-dim"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim">
                    {s.step}
                  </span>
                  <h3 className="mb-3 font-display-black text-xl text-bone md:text-2xl">
                    {s.title}
                  </h3>
                  <p className="max-w-md font-mono text-xs leading-relaxed text-bone-muted">
                    {s.desc}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* final CTA */}
        <div className="mt-24 border-t border-bone/10 pt-16 md:mt-32 md:pt-20">
          <p
            data-reveal
            className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim"
          >
            {CTA_EYEBROW}
          </p>
          <h2
            data-reveal
            className="font-display-black text-3xl leading-[0.95] text-bone md:text-6xl"
          >
            {CTA_HEADLINE}
            <span className="block text-crimson">{CTA_HEADLINE_2}</span>
          </h2>
          <button
            type="button"
            data-reveal
            onClick={() => setConsoleOpen(true)}
            className="mt-12 bg-crimson px-10 py-5 font-mono text-xs uppercase tracking-[0.3em] text-bone transition-all hover:-translate-y-0.5 hover:bg-crimson-bright"
          >
            BRING THE WEIGHT
          </button>
        </div>
      </div>

      {consoleOpen && (
        <IdeaScannerConsole onClose={() => setConsoleOpen(false)} />
      )}
    </section>
  );
}
