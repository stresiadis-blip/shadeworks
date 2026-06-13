"use client";

import { useEffect } from "react";
import {
  ENGINE_EYEBROW,
  ENGINE_HEADLINE,
  ENGINE_BODY,
  ENGINE_AGENTS,
  OPERATOR_EYEBROW,
  OPERATOR_HEADLINE,
  OPERATOR_BODY,
  OPERATOR_STEPS,
} from "@/data/studio";

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
            className="absolute -top-12 right-0 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-muted hover:text-crimson transition-colors"
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
  const agents = ENGINE_AGENTS;
  return (
    <PanelShell onClose={onClose}>
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-signal mb-6">
        {ENGINE_EYEBROW}
      </p>
      <h2 className="font-display-black text-bone text-3xl md:text-5xl mb-8">
        {ENGINE_HEADLINE}
      </h2>
      <p className="font-mono text-sm text-bone-muted leading-relaxed mb-12">
        {ENGINE_BODY}
      </p>
      <div className="space-y-px">
        {agents.map((a, i) => (
          <div
            key={a.name}
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 border-t border-bone/10 py-6 last:border-b"
          >
            <span className="font-mono text-[10px] text-crimson w-8">
              0{i + 1}
            </span>
            <span className="font-display-black text-bone text-lg md:w-64 shrink-0">
              <span className="text-crimson mr-2">&#9656;</span>
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
  const steps = OPERATOR_STEPS;
  return (
    <PanelShell onClose={onClose}>
      <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-signal mb-6">
        {OPERATOR_EYEBROW}
      </p>
      <h2 className="font-display-black text-bone text-3xl md:text-5xl mb-8">
        {OPERATOR_HEADLINE}
      </h2>
      <p className="font-mono text-sm text-bone-muted leading-relaxed mb-12">
        {OPERATOR_BODY}
      </p>
      <div className="space-y-3 mb-12">
        {steps.map((s, i) => {
          const inverted = i % 2 === 1;
          return (
            <div
              key={s.step}
              className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-8 p-6 border ${
                inverted
                  ? "bg-bone text-ink border-bone"
                  : "bg-ink text-bone border-bone/15"
              }`}
            >
              <span className="font-mono text-sm text-crimson font-bold w-20 shrink-0">
                {s.step}
              </span>
              <span
                className={`font-display-black text-lg md:w-72 shrink-0 ${
                  inverted ? "text-ink" : "text-bone"
                }`}
              >
                {s.title}
              </span>
              <span
                className={`font-mono text-xs ${
                  inverted ? "text-ink/70" : "text-bone-muted"
                }`}
              >
                {s.desc}
              </span>
            </div>
          );
        })}
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
