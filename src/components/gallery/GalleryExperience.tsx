"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { PROJECTS, CATEGORY_LABELS, CATEGORY_SHORT } from "@/data/projects";
import type { Project, ProjectCategory } from "@/data/projects";
import { SphereGallery } from "./SphereGallery";
import { ListView } from "./ListView";
import { IdeaScannerConsole } from "./IdeaScannerConsole";
import { EnginePanel, OperatorsPanel } from "./OverlayPanels";
import { AtmosphereLayers } from "./AtmosphereLayers";

type View = "sphere" | "list";
type Panel = "none" | "engine" | "operators" | "console";

const CATEGORIES: (ProjectCategory | "all")[] = [
  "all",
  "custom-code",
  "control-panels",
  "megaphone",
];

export function GalleryExperience() {
  const router = useRouter();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("sphere");
  const [panel, setPanel] = useState<Panel>("none");
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [heroVisible, setHeroVisible] = useState(true);
  const chromeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // hero overlay auto-fade after 4s
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // chrome entrance
  useEffect(() => {
    if (reducedMotion !== false || !chromeRef.current) return;
    gsap.fromTo(
      chromeRef.current.querySelectorAll("[data-chrome]"),
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 0.6, ease: "power3.out" }
    );
  }, [reducedMotion]);

  const handleSelect = (project: Project) => {
    router.push(`/work/${project.slug}`);
  };

  if (reducedMotion === null) {
    return <div className="fixed inset-0 bg-ink" />;
  }

  return (
    <main className="fixed inset-0 bg-ink overflow-hidden">
      {/* gallery layer */}
      {reducedMotion ? (
        <ReducedMotionGrid category={category} />
      ) : view === "sphere" ? (
        <SphereGallery
          projects={PROJECTS}
          activeCategory={category}
          onSelect={handleSelect}
          onFirstDrag={() => setHeroVisible(false)}
        />
      ) : null}
      {!reducedMotion && view === "list" && (
        <ListView projects={PROJECTS} activeCategory={category} />
      )}

      {/* noir atmosphere — rain, grain, halftone, vignette (in front of sphere, behind chrome) */}
      {!reducedMotion && <AtmosphereLayers />}

      {/* hero overlay */}
      <div
        className={`pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-1000 ${
          heroVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="font-display-black text-bone text-3xl md:text-6xl lg:text-7xl max-w-5xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">
          YOU THINK IT.
          <br />
          WE SHADE IT INTO REALITY.
        </h1>
        <p className="font-mono text-[11px] md:text-xs text-bone-muted max-w-2xl mt-8 leading-relaxed tracking-wide drop-shadow-[0_1px_12px_rgba(0,0,0,0.9)]">
          Custom software. App architecture. Business control panels. Digital
          marketing pipelines. All built from nothing. No templates. No
          shortcuts. Just raw execution at machine speed.
        </p>
        {!reducedMotion && (
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-signal mt-12 animate-pulse">
            drag to explore
          </p>
        )}
      </div>

      {/* UI chrome */}
      <div ref={chromeRef} className="pointer-events-none fixed inset-0 z-30">
        {/* logo top-left */}
        <Link
          href="/"
          data-chrome
          className="pointer-events-auto absolute top-6 left-6 font-logo text-2xl text-bone mix-blend-difference hover:opacity-80 transition-opacity"
        >
          shadeworks
        </Link>

        {/* FILTER pill top-center */}
        <div
          data-chrome
          className="pointer-events-auto absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`font-mono text-[10px] uppercase tracking-[0.3em] px-6 py-2.5 rounded-full border transition-colors ${
              filterOpen || category !== "all"
                ? "border-crimson text-bone"
                : "border-bone/30 text-bone hover:border-bone/60"
            }`}
          >
            FILTER{category !== "all" ? ` · ${CATEGORY_SHORT[category]}` : ""}
          </button>
          {filterOpen && (
            <div className="flex flex-col gap-1 bg-ink/90 backdrop-blur-md border border-bone/10 p-2 rounded-lg">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setFilterOpen(false);
                  }}
                  className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 text-left rounded transition-colors ${
                    category === c
                      ? "text-bone bg-crimson/20 border-l-2 border-crimson"
                      : "text-bone-muted hover:text-bone hover:bg-bone/5"
                  }`}
                >
                  {c === "all" ? "ALL SYSTEMS" : CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* EXECUTE DESCENT top-right */}
        <button
          data-chrome
          onClick={() => setPanel("console")}
          className="pointer-events-auto absolute top-6 right-6 font-mono text-[10px] uppercase tracking-[0.3em] px-6 py-2.5 rounded-full bg-crimson text-bone hover:bg-crimson-bright hover:-translate-y-0.5 transition-all"
        >
          EXECUTE DESCENT
        </button>

        {/* view toggle left */}
        {!reducedMotion && (
          <div
            data-chrome
            className="pointer-events-auto absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1"
          >
            {(["sphere", "list"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`font-mono text-[10px] uppercase tracking-[0.25em] px-2 py-2 border-l-2 transition-colors ${
                  view === v
                    ? "border-signal text-bone"
                    : "border-transparent text-bone-dim hover:text-bone"
                }`}
                style={{ writingMode: "vertical-rl" }}
              >
                {view === v ? "▸ " : ""}{v === "sphere" ? "SPHERE" : "INDEX"}
              </button>
            ))}
          </div>
        )}

        {/* sound right */}
        <button
          data-chrome
          className="pointer-events-auto absolute right-6 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.25em] text-bone-dim hover:text-bone transition-colors"
          style={{ writingMode: "vertical-rl" }}
          aria-label="Sound off (coming soon)"
        >
          SOUND [OFF]
        </button>

        {/* bottom-center nav pill */}
        <nav
          data-chrome
          className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-ink/80 backdrop-blur-md border border-bone/15 rounded-full px-2 py-1.5"
        >
          {(
            [
              ["WORK", "none"],
              ["ENGINE", "engine"],
              ["OPERATORS", "operators"],
            ] as [string, Panel][]
          ).map(([label, p]) => (
            <button
              key={label}
              onClick={() => {
                setPanel(p);
                if (p === "none") setView("sphere");
              }}
              className={`font-mono text-[10px] uppercase tracking-[0.25em] px-5 py-2.5 rounded-full transition-colors border-b-2 ${
                panel === p && p !== "none"
                  ? "text-bone border-crimson"
                  : "text-bone-muted border-transparent hover:text-bone"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* overlay panels */}
      {panel === "engine" && <EnginePanel onClose={() => setPanel("none")} />}
      {panel === "operators" && (
        <OperatorsPanel
          onClose={() => setPanel("none")}
          onExecuteDescent={() => setPanel("console")}
        />
      )}
      {panel === "console" && <IdeaScannerConsole onClose={() => setPanel("none")} />}
    </main>
  );
}

/** prefers-reduced-motion fallback: flat CSS grid, same data. */
function ReducedMotionGrid({ category }: { category: ProjectCategory | "all" }) {
  const visible = PROJECTS.filter((p) => category === "all" || p.category === category);
  return (
    <div className="fixed inset-0 z-0 overflow-y-auto pt-28 pb-32 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((p) => (
          <Link
            key={p.id}
            href={`/work/${p.slug}`}
            className="border border-bone/10 bg-ink-elevated p-6 hover:border-crimson transition-colors"
          >
            <div className="flex items-center justify-between mb-6">
              <span
                className="font-mono text-[10px] tracking-wider border px-2 py-1"
                style={{
                  color:
                    p.status === "LIVE"
                      ? "#d11f2a"
                      : p.status === "IN PROGRESS"
                        ? "#f2c200"
                        : "#6e6e6e",
                  borderColor:
                    p.status === "LIVE"
                      ? "#d11f2a"
                      : p.status === "IN PROGRESS"
                        ? "#f2c200"
                        : "#6e6e6e55",
                }}
              >
                {p.status}
              </span>
              <span className="font-mono text-[10px] text-bone-dim">{p.year}</span>
            </div>
            <h2 className="font-display-black text-bone text-xl mb-2">{p.title}</h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-bone-muted mb-3">
              {CATEGORY_SHORT[p.category]}
            </p>
            <p className="font-mono text-[11px] text-bone-muted leading-relaxed">
              {p.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
