import { Code2, ShoppingBag, LayoutDashboard, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

type Service = {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  title: string;
  description: string;
  tags: string[];
};

const SERVICES: Service[] = [
  {
    icon: Code2,
    number: "01",
    title: "Full-stack web apps",
    description:
      "Next.js, Supabase, Stripe. Production apps that scale from MVP to revenue — auth, payments, dashboards, the works.",
    tags: ["Next.js", "Supabase", "TypeScript"],
  },
  {
    icon: ShoppingBag,
    number: "02",
    title: "E-commerce & subscriptions",
    description:
      "Stripe integrations, subscription management, custom checkout flows. Built for conversion and recurring revenue.",
    tags: ["Stripe", "Webhooks", "Customer portal"],
  },
  {
    icon: LayoutDashboard,
    number: "03",
    title: "Custom dashboards",
    description:
      "Admin panels and internal tools that ship in weeks, not months. Role-based access, audit trails, exports.",
    tags: ["Admin", "RBAC", "Reports"],
  },
  {
    icon: Sparkles,
    number: "04",
    title: "Landing pages",
    description:
      "Premium marketing sites that convert. From concept to ship in 2-3 weeks — copywriting and analytics included.",
    tags: ["Marketing", "SEO", "Analytics"],
  },
];

export function Services() {
  return (
    <section id="services" className="relative bg-ink py-32 md:py-48">
      {/* Subtle halftone backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-halftone opacity-[0.04]"
      />

      <div className="container relative mx-auto px-6 max-w-7xl">
        <SectionHeader
          eyebrow="02 — Services"
          title={
            <>
              What we{" "}
              <span className="text-gold-gradient italic">build</span>.
            </>
          }
          intro="Four practices. One studio. Pick the one that fits — or hire us for a project that spans them."
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.number}
                className="group glass-card rounded-lg p-10 md:p-12 flex flex-col min-h-[320px]"
              >
                <div className="flex items-start justify-between mb-10">
                  <span className="font-display text-5xl md:text-6xl text-gold-gradient leading-none">
                    {service.number}
                  </span>
                  <div className="h-12 w-12 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 group-hover:border-gold/60 transition-all">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                </div>

                <h3 className="font-display text-3xl md:text-4xl text-bone leading-tight tracking-tight">
                  {service.title}
                </h3>
                <p className="font-serif-italic text-bone-muted text-lg mt-4 leading-relaxed">
                  {service.description}
                </p>

                <div className="mt-auto pt-8 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.25em] text-bone-dim">
                  {service.tags.map((tag, i) => (
                    <span key={tag} className="flex items-center gap-3">
                      {tag}
                      {i < service.tags.length - 1 ? (
                        <span className="text-gold/40">·</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
