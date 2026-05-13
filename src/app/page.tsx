export default function Home() {
  return (
    <main className="relative bg-ink min-h-screen">
      <section className="container mx-auto px-6 py-32 md:py-48">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-bone-dim mb-8">
          shade works — studio · constanta
        </p>
        <h1 className="font-display text-bone leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}>
          Where code <br />
          casts <span className="text-gold-gradient">long</span>.
        </h1>
        <p className="font-serif-italic text-bone-muted text-xl md:text-2xl mt-8 max-w-2xl">
          Premium software studio. Full-stack web apps, e-commerce, dashboards, and landing pages built to last.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <button className="bg-gold text-ink font-mono text-sm uppercase tracking-widest px-8 py-4 hover:bg-gold-light transition-colors">
            View work
          </button>
          <button className="border border-bone/20 text-bone font-mono text-sm uppercase tracking-widest px-8 py-4 hover:border-gold hover:text-gold transition-colors">
            Get in touch
          </button>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-lg">
            <p className="font-mono text-xs uppercase tracking-widest text-gold mb-4">01 — Glass</p>
            <p className="text-bone">Neutral glass card test.</p>
          </div>
          <div className="glass-card-gold p-8 rounded-lg">
            <p className="font-mono text-xs uppercase tracking-widest text-gold mb-4">02 — Glass gold</p>
            <p className="text-bone">Gold tinted glass card test.</p>
          </div>
          <div className="bg-card-gradient border border-ink-border p-8 rounded-lg">
            <p className="font-mono text-xs uppercase tracking-widest text-gold mb-4">03 — Card gradient</p>
            <p className="text-bone">Plain card gradient test.</p>
          </div>
        </div>
      </section>
    </main>
  );
}