"use client";

import Link from "next/link";
import type { Project, ProjectCategory } from "@/data/projects";
import { CATEGORY_SHORT } from "@/data/projects";

export function ListView({
  projects,
  activeCategory,
}: {
  projects: Project[];
  activeCategory: ProjectCategory | "all";
}) {
  const visible = projects.filter(
    (p) => activeCategory === "all" || p.category === activeCategory
  );
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-ink pt-28 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim mb-8">
          INDEX — {visible.length} ENTRIES
        </p>
        <ul>
          {visible.map((p, i) => (
            <li key={p.id} className="border-t border-bone/10 last:border-b">
              <Link
                href={`/work/${p.slug}`}
                className="group flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8 py-5 hover:bg-bone/[0.03] transition-colors px-2"
              >
                <span className="font-mono text-[10px] text-bone-dim w-8 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display-black text-bone text-xl md:text-2xl md:w-72 shrink-0 group-hover:text-crimson transition-colors">
                  {p.title}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-bone-muted md:w-40 shrink-0">
                  {CATEGORY_SHORT[p.category]}
                </span>
                <span className="font-mono text-[10px] text-bone-dim md:w-24 shrink-0">
                  {p.status}
                </span>
                <span className="font-mono text-[10px] text-bone-dim ml-auto">
                  {p.year}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
