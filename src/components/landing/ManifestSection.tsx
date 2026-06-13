import type { ProjectCategory } from "@/data/projects";
import { CATEGORY_LABELS } from "@/data/projects";
import {
  MANIFEST_EYEBROW,
  MANIFEST_HEADLINE,
  MANIFEST_BODY,
  CATEGORY_BLURBS,
} from "@/data/studio";

/**
 * Inline noir track glyphs — thin monochrome line icons, one per capability
 * track. currentColor so the parent controls the noir tone (bone -> crimson on
 * hover).
 */
const TRACK_ICONS: Record<ProjectCategory, React.ReactNode> = {
  // custom code — angle brackets + slash
  "custom-code": (
    <>
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </>
  ),
  // control panels — horizontal sliders
  "control-panels": (
    <>
      <line x1="21" y1="6" x2="14" y2="6" />
      <line x1="10" y1="6" x2="3" y2="6" />
      <line x1="21" y1="12" x2="12" y2="12" />
      <line x1="8" y1="12" x2="3" y2="12" />
      <line x1="21" y1="18" x2="16" y2="18" />
      <line x1="12" y1="18" x2="3" y2="18" />
      <line x1="14" y1="4" x2="14" y2="8" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="16" y1="16" x2="16" y2="20" />
    </>
  ),
  // the megaphone — bullhorn
  megaphone: (
    <>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
};

function TrackIcon({ category }: { category: ProjectCategory }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
    >
      {TRACK_ICONS[category]}
    </svg>
  );
}

/**
 * S2 — manifest + the three real capability tracks. First solid section that
 * slides up over the pinned hero. Copy is byte-for-byte from studio.ts.
 */
export function ManifestSection() {
  return (
    <section className="border-t border-bone/10 bg-ink px-6 py-28 md:py-40">
      <div className="mx-auto max-w-5xl">
        <p
          data-reveal
          className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim"
        >
          {MANIFEST_EYEBROW}
        </p>
        <h2
          data-reveal
          className="mb-6 font-display-black text-3xl text-bone md:text-6xl"
        >
          {MANIFEST_HEADLINE}
        </h2>
        <p
          data-reveal
          className="mb-16 max-w-2xl font-mono text-xs leading-relaxed text-bone-muted md:text-sm"
        >
          {MANIFEST_BODY}
        </p>

        <div data-reveal-group className="flex flex-col">
          {CATEGORY_BLURBS.map(({ category, blurb }, i) => (
            <div
              key={category}
              data-reveal-item
              className="group relative flex flex-col gap-4 border-t border-bone/10 py-8 last:border-b md:flex-row md:items-center md:gap-8"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-2 right-0 select-none font-display-black text-7xl text-bone/[0.04] md:text-8xl"
              >
                0{i + 1}
              </span>
              <span className="shrink-0 text-bone-muted transition-colors duration-500 group-hover:text-crimson">
                <TrackIcon category={category} />
              </span>
              <span className="shrink-0 font-mono text-[10px] tracking-[0.3em] text-crimson md:w-10">
                0{i + 1}
              </span>
              <span className="shrink-0 font-display-black text-xl text-bone md:w-72 md:text-2xl">
                {CATEGORY_LABELS[category].replace(/^\d+\s*\/\/\s*/, "")}
              </span>
              <span className="max-w-md font-mono text-xs leading-relaxed text-bone-muted">
                {blurb}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
