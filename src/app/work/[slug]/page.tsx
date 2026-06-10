import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PROJECTS, CATEGORY_LABELS } from "@/data/projects";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return { title: "Not found · Shade Works" };
  return {
    title: `${project.title} · Shade Works`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-ink px-6 pt-28 pb-32">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-muted hover:text-gold transition-colors"
        >
          &lt; BACK TO GALLERY
        </Link>

        <div className="mt-16 flex items-center gap-4">
          <span
            className="font-mono text-[10px] tracking-wider border px-2.5 py-1"
            style={{
              color: project.status === "LIVE" ? "#c9a961" : "#8a8275",
              borderColor: project.status === "LIVE" ? "#c9a961" : "#8a827555",
            }}
          >
            {project.status}
          </span>
          <span className="font-mono text-[10px] text-bone-dim">{project.year}</span>
        </div>

        <h1 className="font-display-black text-bone mt-6 text-5xl md:text-7xl">
          {project.title}
        </h1>

        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold mt-8">
          {CATEGORY_LABELS[project.category]}
        </p>

        <p className="font-mono text-sm text-bone-muted leading-relaxed mt-10 max-w-2xl">
          {project.description}.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] uppercase tracking-wider border border-bone/15 text-bone-dim px-3 py-1.5"
            >
              {tag}
            </span>
          ))}
        </div>

        {project.status !== "LIVE" && (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-dim mt-16 border-t border-bone/10 pt-8">
            This is a concept build from the Shade Works lab — not a client
            engagement.
          </p>
        )}

        <Link
          href="/"
          className="inline-block mt-16 font-mono text-[11px] uppercase tracking-[0.25em] px-8 py-4 border border-bone/20 text-bone hover:border-gold hover:text-gold transition-colors"
        >
          RETURN TO GALLERY
        </Link>
      </div>
    </main>
  );
}
