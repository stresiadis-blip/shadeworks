import Link from "next/link";
import { ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink min-h-screen flex items-center pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Decorative shadow arc */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 w-[120%] max-w-[1200px] opacity-[0.07]"
        viewBox="0 0 800 800"
        fill="none"
      >
        <defs>
          <radialGradient id="shadeArc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a961" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#c9a961" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#c9a961" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="400" cy="400" r="380" stroke="url(#shadeArc)" strokeWidth="1" />
        <circle cx="400" cy="400" r="300" stroke="url(#shadeArc)" strokeWidth="1" />
        <circle cx="400" cy="400" r="220" stroke="url(#shadeArc)" strokeWidth="1" />
      </svg>

      {/* Halftone dust */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-halftone opacity-[0.05]"
      />

      <div className="container relative mx-auto px-6 max-w-7xl">
        {/* Eyebrow */}
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-bone-dim mb-10 flex items-center gap-3">
          <span className="inline-block h-px w-10 bg-gold/60" />
          shade works — software studio · constanta
        </p>

        {/* Headline */}
        <h1
          className="font-display text-bone leading-[0.92] tracking-tight max-w-[18ch]"
          style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}
        >
          Where code <br className="hidden md:block" />
          casts <span className="text-gold-gradient italic">long</span>.
        </h1>

        {/* Sub */}
        <p className="font-serif-italic text-bone-muted text-xl md:text-2xl lg:text-3xl mt-10 max-w-2xl leading-relaxed">
          A premium software studio shipping full-stack web apps, e-commerce,
          dashboards and landing pages — built with restraint, intent, and the
          long view.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="#work"
            className="group inline-flex items-center gap-3 bg-gold text-ink font-mono text-xs uppercase tracking-[0.25em] px-8 py-4 hover:bg-gold-light transition-colors"
          >
            View work
            <span className="inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="#contact"
            className="group inline-flex items-center gap-3 border border-bone/20 text-bone font-mono text-xs uppercase tracking-[0.25em] px-8 py-4 hover:border-gold hover:text-gold transition-colors"
          >
            Get in touch
          </Link>
        </div>

        {/* Trust signal */}
        <div className="mt-14 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-50 animate-pulse-dot" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-bone-dim">
            Currently shipping FerdiPoker · Available for new projects Q3 2026
          </p>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-bone-dim"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
          Scroll
        </span>
        <ArrowDown className="h-4 w-4 animate-scroll-cue text-gold" />
      </div>
    </section>
  );
}
