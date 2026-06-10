"use client";

import { useEffect } from "react";

function PanelShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-6 py-24">
        <div className="w-full max-w-3xl relative">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-muted hover:text-gold transition-colors"
          >
            [ESC] CLOSE
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

export function EnginePanel({ onClose }: { onClose: () => void }) {
  const agents = [
    {
      name: "ARCHITECT AGENT",
      desc: "Designs the system — schema, routes, infrastructure — before a single line ships.",
    },
    {
      name: "BUILD AGENT",
      desc: "Writes, tests, and reviews production code in parallel streams, around the clock.",
    },
    {
      name: "DEPLOY AGENT",
      desc: "Ships to production with green builds, rollback paths, and zero-downtime cutovers.",
    },
  ];
  return (
    <PanelShell onClose={onClose}>
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold mb-6">
        THE ENGINE
      </p>
      <h2 className="font-display-black text-bone text-3xl md:text-5xl mb-8">
        80% FASTER DEPLOYMENT. ZERO TEMPLATES. EVER.
      </h2>
      <p className="font-mono text-sm text-bone-muted leading-relaxed mb-12">
        Shade Works runs a coordinated swarm of specialized AI agents — each one
        trained to architect, code, test, and deploy. They work in parallel. They
        don&apos;t sleep. They don&apos;t make the same mistake twice. What takes
        agencies 6 months ships in 6 weeks. What takes developers 3 sprints ships
        in 3 days.
      </p>
      <div className="space-y-px">
        {agents.map((a, i) => (
          <div
            key={a.name}
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 border-t border-bone/10 py-6 last:border-b"
          >
            <span className="font-mono text-[10px] text-bone-dim w-8">
              0{i + 1}
            </span>
            <span className="font-display-black text-bone text-lg md:w-64 shrink-0">
              {a.name}
            </span>
            <span className="font-mono text-xs text-bone-muted leading-relaxed">
              {a.desc}
            </span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

export function OperatorsPanel({
  onClose,
  onExecuteDescent,
}: {
  onClose: () => void;
  onExecuteDescent: () => void;
}) {
  const steps = [
    { step: "STEP 01", title: "SUBMIT YOUR BRIEF", desc: "Tell us what you want built. Raw, unfiltered, ambitious." },
    { step: "STEP 02", title: "SHADE ENGINE ANALYSIS", desc: "Technical breakdown within 48 hours." },
    { step: "STEP 03", title: "EXECUTION BEGINS", desc: "The swarm deploys. You watch it take shape." },
  ];
  return (
    <PanelShell onClose={onClose}>
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold mb-6">
        OPERATORS
      </p>
      <h2 className="font-display-black text-bone text-3xl md:text-5xl mb-8">
        LOCK IN YOUR CONSULTATION.
      </h2>
      <p className="font-mono text-sm text-bone-muted leading-relaxed mb-12">
        Shade Works operates in limited capacity. We don&apos;t scale headcount —
        we scale output. Every engagement is deliberate, every client is vetted,
        and every build is treated like a mission, not a project.
      </p>
      <div className="space-y-px mb-12">
        {steps.map((s) => (
          <div
            key={s.step}
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 border-t border-bone/10 py-6 last:border-b"
          >
            <span className="font-mono text-[10px] text-gold w-20 shrink-0">{s.step}</span>
            <span className="font-display-black text-bone text-lg md:w-72 shrink-0">
              {s.title}
            </span>
            <span className="font-mono text-xs text-bone-muted">{s.desc}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onExecuteDescent}
        className="font-mono text-xs uppercase tracking-[0.3em] px-10 py-5 bg-crimson text-bone hover:bg-crimson/85 transition-colors"
      >
        EXECUTE DESCENT
      </button>
    </PanelShell>
  );
}
