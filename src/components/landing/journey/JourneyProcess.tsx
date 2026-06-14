"use client";

import type { RefObject } from "react";
import { useSnapshot } from "valtio";
import { journeyStore } from "./journeyStore";
import {
  ENGINE_EYEBROW,
  ENGINE_HEADLINE,
  ENGINE_BODY,
  ENGINE_AGENTS,
  OPERATOR_STEPS,
} from "@/data/studio";

interface Step {
  title: string;
  desc: string;
}

/** Six steps, byte-for-byte from studio.ts: the 3 ENGINE agents + 3 operator steps. */
const STEPS: Step[] = [
  ...ENGINE_AGENTS.map((a) => ({ title: a.name, desc: a.desc })),
  ...OPERATOR_STEPS.map((s) => ({ title: s.title, desc: s.desc })),
];

/**
 * The pinned process panel. The active step (from the valtio store, the only
 * thing that re-renders here) expands with its paragraph; the rest collapse to
 * number + title. The vertical line is filled by the parent's scroll timeline
 * via `fillRef`. Under reduced motion every step is expanded and readable.
 */
export function JourneyProcess({
  fillRef,
  reduced,
}: {
  fillRef: RefObject<HTMLSpanElement | null>;
  reduced: boolean;
}) {
  const snap = useSnapshot(journeyStore);
  const active = snap.activeStep;

  return (
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
        <span aria-hidden className="absolute left-[18px] top-2 bottom-2 w-px bg-bone/10" />
        <span
          ref={fillRef}
          aria-hidden
          className="absolute left-[18px] top-2 bottom-2 w-px origin-top bg-crimson"
          style={{ transform: reduced ? "scaleY(1)" : "scaleY(0)" }}
        />
        <ol className="flex flex-col gap-6">
          {STEPS.map((s, i) => {
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
                <div
                  className="grid transition-all duration-500 ease-out"
                  style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0 }}
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
  );
}
