import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { TechChip } from "@/components/TechChip";
import { CASE_STUDIES } from "@/lib/work";

export function Work() {
  const ferdi = CASE_STUDIES[0];

  return (
    <section id="work" className="relative py-32 md:py-48 bg-ink/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeader
          eyebrow="01 — Selected work"
          title={
            <>
              Built to <span className="text-gold-gradient italic">last</span>.
              <br />
              Not just ship.
            </>
          }
          intro="A small, deliberate portfolio. Each project gets the time it deserves — design, code, deploy and the boring-but-essential maintenance after launch."
        />

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main case study — spans 2 cols on desktop */}
          <Link
            href={`/work/${ferdi.slug}`}
            className="group lg:col-span-2 glass-card-gold rounded-lg p-10 md:p-14 flex flex-col justify-between min-h-[420px] relative overflow-hidden"
          >
            {/* Status pill */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-60 animate-pulse-dot" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
                </span>
                Live · {ferdi.year}
              </span>
              <ArrowUpRight className="h-5 w-5 text-bone-muted group-hover:text-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-bone-dim mb-4">
                {ferdi.role}
              </p>
              <h3
                className="font-project text-bone leading-[1]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                {ferdi.name}
              </h3>
              <p className="font-serif-italic text-bone-muted text-lg md:text-xl mt-6 max-w-xl leading-relaxed">
                {ferdi.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {ferdi.stack.map((tech) => (
                  <TechChip key={tech}>{tech}</TechChip>
                ))}
              </div>

              <div className="mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-gold group-hover:gap-3 transition-all">
                View case study
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Placeholder: Concept work */}
          <div className="glass-card rounded-lg p-10 flex flex-col justify-between min-h-[420px]">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-bone-dim/60" />
              Concept work · ongoing
            </span>

            <div className="mt-12">
              <h3
                className="font-heading-serif text-bone-muted leading-[1] tracking-tight"
                style={{ fontSize: "clamp(2rem, 3vw, 3rem)" }}
              >
                Concept <br /> work
              </h3>
              <p className="font-serif-italic text-bone-dim text-base mt-4 max-w-xs leading-relaxed">
                R&D, internal tools, design experiments. Not all client work is public.
              </p>
            </div>

            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-bone-dim">
              Available on request
            </p>
          </div>

          {/* Placeholder: more coming */}
          <div className="lg:col-span-3 glass-card rounded-lg p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                Q3 2026
              </span>
              <h3
                className="font-heading-serif text-bone leading-[1] tracking-tight mt-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                More coming soon.
              </h3>
              <p className="font-serif-italic text-bone-muted text-base md:text-lg mt-3 max-w-xl leading-relaxed">
                Two new builds in active development. Subscribe below or check back later.
              </p>
            </div>
            <Link
              href="#contact"
              className="shrink-0 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-bone hover:text-gold transition-colors border border-bone/15 hover:border-gold px-6 py-3"
            >
              Get notified <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
