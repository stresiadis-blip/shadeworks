import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { TechChip } from "@/components/TechChip";
import { getCaseStudy, getAllCaseStudySlugs } from "@/lib/work";

export function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Not found · Shade Works" };
  return {
    title: `${study.name} — Case study · Shade Works`,
    description: study.tagline,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <main className="relative bg-ink">
      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-halftone opacity-[0.04]"
        />
        <div className="container relative mx-auto px-6 max-w-6xl">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-bone-muted hover:text-gold transition-colors mb-12 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to work
          </Link>

          <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-gold mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-10 bg-gold/60" />
            {study.status === "live" ? "Live" : study.status === "concept" ? "Concept" : "WIP"} · {study.year}
          </p>

          <h1
            className="font-display text-bone leading-[0.92] tracking-tight"
            style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
          >
            {study.name}
          </h1>

          <p className="font-serif-italic text-bone-muted text-xl md:text-2xl lg:text-3xl mt-8 max-w-3xl leading-relaxed">
            {study.tagline}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {study.liveUrl ? (
              <a
                href={study.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-gold text-ink font-mono text-xs uppercase tracking-[0.25em] px-8 py-4 hover:bg-gold-light transition-colors"
              >
                Visit live site
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ) : null}
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bone-dim">
              Role: {study.role}
            </span>
          </div>
        </div>
      </section>

      {/* Tech stack strip */}
      <section className="border-y border-bone/5 bg-ink-elevated/40 py-8">
        <div className="container mx-auto px-6 max-w-6xl flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim mr-2">
            Stack
          </span>
          {study.stack.map((tech) => (
            <TechChip key={tech}>{tech}</TechChip>
          ))}
        </div>
      </section>

      {/* Visual placeholder */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="glass-card-gold rounded-lg aspect-[16/10] flex items-center justify-center relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-halftone-dense opacity-30"
            />
            <div className="relative text-center px-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold mb-4">
                Visual placeholder
              </p>
              <p className="font-display text-3xl md:text-5xl text-bone-muted leading-tight">
                Screenshots <br />
                <span className="text-gold-gradient italic">coming soon</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content blocks */}
      <section className="pb-32 md:pb-48">
        <div className="container mx-auto px-6 max-w-4xl space-y-20">
          <ContentBlock eyebrow="Overview" title="The brief">
            {study.overview}
          </ContentBlock>

          <ContentBlock eyebrow="Problem" title="What we were solving">
            {study.problem}
          </ContentBlock>

          <ContentBlock eyebrow="Solution" title="How we shipped it">
            {study.solution}
          </ContentBlock>

          {study.results && study.results.length > 0 ? (
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-gold mb-4">
                Results
              </p>
              <h2
                className="font-display text-bone leading-[0.95] tracking-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                The <span className="text-gold-gradient italic">numbers</span>.
              </h2>
              <ul className="mt-10 space-y-6">
                {study.results.map((r, i) => (
                  <li
                    key={r}
                    className="flex items-start gap-6 pb-6 border-b border-bone/10 last:border-b-0"
                  >
                    <span className="font-display text-3xl md:text-4xl text-gold-gradient leading-none shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-serif text-bone-muted text-lg md:text-xl leading-relaxed pt-1">
                      {r}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-bone/5 bg-ink-elevated py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-gold mb-6">
            Next
          </p>
          <h2
            className="font-display text-bone leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Have a project <br />
            in <span className="text-gold-gradient italic">mind</span>?
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/#contact"
              className="group inline-flex items-center gap-3 bg-gold text-ink font-mono text-xs uppercase tracking-[0.25em] px-8 py-4 hover:bg-gold-light transition-colors"
            >
              Start a project
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#work"
              className="inline-flex items-center gap-3 border border-bone/20 text-bone font-mono text-xs uppercase tracking-[0.25em] px-8 py-4 hover:border-gold hover:text-gold transition-colors"
            >
              See more work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContentBlock({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-gold mb-4">
        {eyebrow}
      </p>
      <h2
        className="font-display text-bone leading-[0.95] tracking-tight"
        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
      >
        {title}
      </h2>
      <p className="font-serif text-bone-muted text-lg md:text-xl mt-6 leading-relaxed">
        {children}
      </p>
    </div>
  );
}
