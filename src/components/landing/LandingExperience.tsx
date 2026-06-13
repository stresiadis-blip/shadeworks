"use client";

import Link from "next/link";
import { JourneySection } from "./JourneySection";

/**
 * Landing experience (noir ShadeWorks). The page IS the canvas journey now —
 * a single full-screen scroll-driven scene. All copy lives as an overlay on
 * the canvas (see JourneySection); there are no separate typographic sections.
 *
 * The old ManifestSection / ProofSection / EngineSection components still exist
 * on disk but are intentionally unmounted here — their copy may be reused as
 * per-chapter overlays (C2) or on dedicated pages later.
 */
export function LandingExperience() {
  return (
    <div className="relative">
      {/* clean fixed header — sits above the canvas, transparent, reads over noir */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-logo text-2xl text-bone transition-opacity hover:opacity-80"
        >
          shadeworks
        </Link>
        <nav className="flex items-center gap-7">
          {["Work", "Studio", "Contact"].map((label) => (
            <Link
              key={label}
              href="#"
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-bone-muted transition-colors hover:text-bone"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <JourneySection />
    </div>
  );
}
