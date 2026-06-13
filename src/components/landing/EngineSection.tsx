import {
  ENGINE_EYEBROW,
  ENGINE_HEADLINE,
  ENGINE_BODY,
  ENGINE_AGENTS,
} from "@/data/studio";

/**
 * S4 — the engine. Vectr "sticky device" model: the left column (eyebrow +
 * headline + body) stays pinned via pure CSS `position: sticky` while the right
 * column — the three agents — flows past it on scroll. Upgrade over the old
 * StoryScroll ENGINE (plain reveal list, no sticky). Copy byte-for-byte from
 * studio.ts; reveals come from the existing driver in LandingExperience.
 */
export function EngineSection() {
  return (
    <section className="border-t border-bone/10 bg-ink px-6 py-28 md:py-40">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
        {/* left — pinned device */}
        <div className="md:sticky md:top-24 md:self-start">
          <p
            data-reveal
            className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-bone-dim"
          >
            {ENGINE_EYEBROW}
          </p>
          <h2
            data-reveal
            className="mb-6 font-display-black text-3xl text-bone md:text-5xl"
          >
            {ENGINE_HEADLINE}
          </h2>
          <p
            data-reveal
            className="max-w-md font-mono text-xs leading-relaxed text-bone-muted md:text-sm"
          >
            {ENGINE_BODY}
          </p>
        </div>

        {/* right — agents flow past */}
        <div data-reveal-group className="flex flex-col">
          {ENGINE_AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              data-reveal-item
              className="flex flex-col gap-3 border-t border-bone/10 py-8 first:border-t-0 first:pt-0 md:py-10"
            >
              <span className="font-mono text-[10px] tracking-[0.3em] text-crimson">
                0{i + 1}
              </span>
              <h3 className="flex items-center gap-3 font-display-black text-xl text-bone md:text-2xl">
                <span aria-hidden className="text-crimson">
                  ▸
                </span>
                {agent.name}
              </h3>
              <p className="max-w-sm font-mono text-xs leading-relaxed text-bone-muted">
                {agent.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
