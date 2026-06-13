import Image from "next/image";
import Link from "next/link";
import { PROOF_EYEBROW, PROOF_HEADLINE } from "@/data/studio";
import { getCaseStudy } from "@/lib/work";

/**
 * Qualitative proof tiles — the receipt without fake numbers. Same visual
 * language as the Manifest tracks (border-bone/10, crimson-accented label,
 * mono sub-line). No subscriber counts: LIVE / STRIPE / 0 TEMPLATES.
 */
const PROOF_TILES = [
  { label: "LIVE", line: "In production. Real users, real uptime." },
  { label: "STRIPE", line: "Recurring subscriptions. Real revenue, not a demo." },
  { label: "0 TEMPLATES", line: "Built from nothing. No theme, no boilerplate." },
];

/**
 * S3 — proof. The single real LIVE build (FerdiPoker) turned into noir
 * ShadeWorks. Answers "why should I believe you?" before ENGINE/PROCESS/CTA.
 * Copy is byte-for-byte from studio.ts; project data from lib/work.ts.
 */
export function ProofSection() {
  const study = getCaseStudy("ferdipoker");
  if (!study) return null;

  return (
    <section className="border-t border-bone/10 bg-ink px-6 py-28 md:py-40">
      <div className="mx-auto max-w-5xl">
        <p
          data-reveal
          className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim"
        >
          {PROOF_EYEBROW}
        </p>
        <h2
          data-reveal
          className="mb-16 font-display-black text-3xl text-bone md:text-6xl"
        >
          {PROOF_HEADLINE}
        </h2>

        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
          {/* noir-graded build still — links to the internal case study */}
          <Link
            href={`/work/${study.slug}`}
            data-reveal
            className="group relative block overflow-hidden border border-crimson/30 bg-ink"
          >
            <span className="relative block aspect-[4/3]">
              <Image
                src={`/work/${study.slug}.jpg`}
                alt={`${study.name} — ${study.tagline}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-80 grayscale-[0.35] transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
              />
            </span>
          </Link>

          {/* project meta + CTA */}
          <div data-reveal className="flex flex-col gap-5">
            <h3 className="font-display-black text-2xl text-bone md:text-3xl">
              {study.name}
            </h3>
            <p className="max-w-md font-mono text-xs leading-relaxed text-bone-muted md:text-sm">
              {study.tagline}
            </p>
            <p className="font-mono text-[11px] tracking-[0.2em] text-bone-dim">
              {study.stack.join("  ·  ")}
            </p>

            <div className="mt-2 flex flex-col gap-3">
              <Link
                href={`/work/${study.slug}`}
                className="group inline-flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-gold transition-colors hover:text-bone"
              >
                READ THE CASE STUDY
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              {study.liveUrl && (
                <a
                  href={study.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit font-mono text-[11px] tracking-[0.2em] text-bone-dim transition-colors hover:text-crimson"
                >
                  LIVE → {study.liveUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* qualitative proof tiles — no fake numbers */}
        <div
          data-reveal-group
          className="mt-16 grid gap-px border border-bone/10 bg-bone/10 md:grid-cols-3"
        >
          {PROOF_TILES.map((tile) => (
            <div
              key={tile.label}
              data-reveal-item
              className="flex flex-col gap-3 bg-ink p-8"
            >
              <span className="font-display-black text-lg text-crimson md:text-xl">
                {tile.label}
              </span>
              <span className="font-mono text-xs leading-relaxed text-bone-muted">
                {tile.line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
