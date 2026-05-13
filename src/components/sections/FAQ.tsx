import { Plus } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

type Faq = {
  q: string;
  a: string;
};

const FAQS: Faq[] = [
  {
    q: "How much does a project cost?",
    a: "It depends on scope, complexity, and timeline. Typical projects fall between €3k (landing page) and €15k (full-stack web app with payments). After a free discovery call we send a fixed-price proposal — no hourly surprises.",
  },
  {
    q: "How long does it take?",
    a: "Two to eight weeks end-to-end is the common range. Landing pages ship in 2-3 weeks. Web apps with auth and payments take 4-8. We work in weekly milestones, so you see real progress every Friday.",
  },
  {
    q: "Do you work with non-tech founders?",
    a: "Often preferred. We handle the technical decisions so you can focus on the business. Expect plain-English check-ins, opinionated recommendations, and no jargon dumps.",
  },
  {
    q: "What's included?",
    a: "Design, development, deployment, and 30 days of post-launch support — fixes, tweaks, content updates. Source code is yours, hosting is set up under your accounts, documentation is delivered at handover.",
  },
  {
    q: "Where are you based?",
    a: "Constanta, Romania (GMT+2). We work remote with clients globally — Romania, Western Europe, the US. Sync calls weekly, async the rest of the time.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-32 md:py-48">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeader
          eyebrow="05 — Frequently asked"
          title={
            <>
              Common <span className="text-gold-gradient italic">questions</span>.
            </>
          }
          intro="Answers to the things most clients ask before reaching out. If yours isn't here, the contact form is below."
        />

        <div className="mt-20 max-w-4xl">
          {FAQS.map((faq, i) => (
            <details
              key={faq.q}
              className="group border-b border-bone/10 py-6 first:border-t"
            >
              <summary className="cursor-pointer flex items-start justify-between gap-6 list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-start gap-6 md:gap-8">
                  <span className="font-mono text-xs text-gold pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl text-bone leading-tight tracking-tight pr-4">
                    {faq.q}
                  </h3>
                </div>
                <span className="shrink-0 h-10 w-10 rounded-full border border-bone/15 flex items-center justify-center bg-ink-elevated group-hover:border-gold group-hover:bg-gold/5 transition-all">
                  <Plus className="h-4 w-4 text-bone group-open:rotate-45 transition-transform duration-300" />
                </span>
              </summary>
              <div className="mt-4 pl-0 md:pl-14">
                <p className="font-serif text-bone-muted text-lg leading-relaxed max-w-2xl">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
