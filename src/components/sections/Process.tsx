import { SectionHeader } from "@/components/SectionHeader";

type Step = {
  number: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Discovery",
    duration: "Week 1",
    description:
      "We start with the problem, not the solution. Scope, constraints, audience, success metrics — written down, agreed on.",
    deliverables: ["Brief", "Scope doc", "Timeline"],
  },
  {
    number: "02",
    title: "Design",
    duration: "Week 2 — 3",
    description:
      "Wireframes first, then high-fidelity. Brand alignment, copy, accessibility audit before a single line of production code.",
    deliverables: ["Wireframes", "Hi-fi mockups", "Brand system"],
  },
  {
    number: "03",
    title: "Build",
    duration: "Week 3 — 6",
    description:
      "Production code with tests, staging environment, weekly demos. You see progress, not promises.",
    deliverables: ["Staging URL", "Weekly demo", "Test coverage"],
  },
  {
    number: "04",
    title: "Ship & support",
    duration: "Week 6+",
    description:
      "Deploy, monitor, iterate. 30 days of post-launch support included — fixes, tweaks, and a calm handover.",
    deliverables: ["Production deploy", "30-day support", "Handover doc"],
  },
];

export function Process() {
  return (
    <section id="process" className="relative py-32 md:py-48 border-y border-bone/5 bg-ink-elevated/40 backdrop-blur-sm">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeader
          eyebrow="03 — Process"
          title={
            <>
              From brief to <span className="text-gold-gradient italic">production</span>.
            </>
          }
          intro="Four phases. Typically 4-8 weeks end-to-end depending on scope. Transparent, billable in milestones, no surprises."
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="relative flex flex-col"
            >
              {/* Connector line (desktop only, except last) */}
              {i < STEPS.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="hidden lg:block absolute top-8 left-[3.5rem] right-[-2rem] h-px bg-gradient-to-r from-gold/40 to-transparent"
                />
              ) : null}

              <div className="relative">
                <span
                  className="font-display text-gold-gradient leading-none block"
                  style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)" }}
                >
                  {step.number}
                </span>
                <span className="absolute -top-1 left-[3.5rem] font-mono text-[10px] uppercase tracking-[0.25em] text-bone-dim">
                  {step.duration}
                </span>
              </div>

              <h3 className="font-display text-3xl md:text-4xl text-bone leading-tight tracking-tight mt-6">
                {step.title}
              </h3>

              <p className="font-serif-italic text-bone-muted text-lg mt-4 leading-relaxed">
                {step.description}
              </p>

              <ul className="mt-6 space-y-2">
                {step.deliverables.map((d) => (
                  <li
                    key={d}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-dim flex items-center gap-3"
                  >
                    <span className="inline-block h-px w-3 bg-gold/60" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
