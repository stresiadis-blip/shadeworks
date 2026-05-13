type Stat = {
  value: string;
  label: string;
};

const STATS: Stat[] = [
  { value: "9+", label: "Years writing code" },
  { value: "12", label: "Products shipped" },
  { value: "∞", label: "Coffees per week" },
];

export function About() {
  return (
    <section id="about" className="relative py-32 md:py-48 overflow-hidden">
      <div className="container relative mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left — heading */}
          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-gold mb-6">
              04 — About
            </p>
            <h2
              className="font-display text-bone leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
            >
              A studio of one.
              <br />
              Sometimes{" "}
              <span className="text-gold-gradient italic">two</span>.
            </h2>

            <div className="mt-10 space-y-6 max-w-2xl">
              <p className="font-serif text-bone-muted text-lg md:text-xl leading-relaxed">
                Shade Works is run by <span className="text-bone">Adrian</span> —
                an ex-navy engineer turned full-stack developer based in
                Constanta, Romania. Background in systems thinking, foreground
                in product. Builds with restraint, ships in milestones, and
                cares more about the boring details than the loud ones.
              </p>
              <p className="font-serif text-bone-muted text-lg md:text-xl leading-relaxed">
                Currently shipping FerdiPoker — the first Romanian-language MTT
                poker training platform. Before that: a decade of one-off
                projects, internal tools, and the slow accumulation of taste.
              </p>
            </div>

            {/* Quote */}
            <blockquote className="mt-12 border-l-2 border-gold pl-6 max-w-2xl">
              <p className="font-serif-italic text-bone text-2xl md:text-3xl leading-relaxed">
                &ldquo;The best software is the kind you don&rsquo;t notice. It
                gets out of the way and just lets you do the thing.&rdquo;
              </p>
              <footer className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
                — studio principle no. 1
              </footer>
            </blockquote>
          </div>

          {/* Right — stats */}
          <div className="lg:col-span-5 lg:pt-24">
            <div className="glass-card rounded-lg p-10 md:p-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold mb-8">
                By the numbers
              </p>
              <div className="space-y-8 md:space-y-10">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-baseline justify-between gap-6 border-b border-bone/5 pb-6 last:border-b-0 last:pb-0"
                  >
                    <span
                      className="font-display text-gold-gradient leading-none"
                      style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
                    >
                      {stat.value}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bone-muted text-right">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 px-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
                Based in
              </p>
              <p className="font-display text-3xl md:text-4xl text-bone mt-2">
                Constanta, Romania
              </p>
              <p className="font-serif-italic text-bone-muted mt-2">
                Working remote, globally. GMT+2.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
