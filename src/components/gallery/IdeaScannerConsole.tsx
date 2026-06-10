"use client";

import { useEffect, useRef, useState } from "react";

type Step = "brief" | "name" | "email" | "sending" | "done" | "error";

type ConsoleProps = {
  onClose: () => void;
};

export function IdeaScannerConsole({ onClose }: ConsoleProps) {
  const [step, setStep] = useState<Step>("brief");
  const [brief, setBrief] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (step === "brief") textareaRef.current?.focus();
    else inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    setStep("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          projectType: "other",
          message: brief,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "TRANSMISSION FAILED");
      }
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "TRANSMISSION FAILED");
      setStep("error");
    }
  };

  const Caret = () => (
    <span className="inline-block w-[9px] h-[1.1em] bg-crimson align-middle animate-caret ml-1" />
  );

  const promptLine = (label: string) => (
    <p className="font-mono text-[11px] md:text-xs text-bone-dim tracking-wider mb-2">
      USER@SHADEWORKS:~ $ {label}
    </p>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-3xl border border-bone/15 bg-ink p-6 md:p-10 relative">
        {/* terminal header bar */}
        <div className="flex items-center justify-between border-b border-bone/10 pb-4 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
            IDEA SCANNER CONSOLE — v1.0
          </span>
          <button
            onClick={onClose}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-muted hover:text-crimson transition-colors"
            aria-label="Close console"
          >
            [ESC] CLOSE
          </button>
        </div>

        {step === "brief" && (
          <div>
            {promptLine("Describe the machine you want us to build...")}
            <textarea
              ref={textareaRef}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full bg-transparent font-mono text-sm md:text-base text-bone resize-none outline-none border border-bone/10 focus:border-bone/25 p-4 placeholder:text-bone-dim/50"
              placeholder="> _"
            />
            <div className="mt-6 flex items-center justify-between">
              <span className="font-mono text-[10px] text-bone-dim">
                {brief.trim().length < 10 ? "MIN 10 CHARS" : "READY"}
                <Caret />
              </span>
              <button
                disabled={brief.trim().length < 10}
                onClick={() => setStep("name")}
                className="font-mono text-[11px] uppercase tracking-[0.25em] px-6 py-3 border border-bone/20 text-bone hover:border-crimson hover:text-crimson transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                NEXT &gt;
              </button>
            </div>
          </div>
        )}

        {step === "name" && (
          <div>
            <p className="font-mono text-[11px] text-bone-dim mb-6">&gt; BRIEF CAPTURED. {brief.trim().length} CHARS.</p>
            {promptLine("Identify yourself. Name:")}
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim().length >= 2 && setStep("email")}
              spellCheck={false}
              className="w-full bg-transparent font-mono text-base text-bone outline-none border-b border-bone/15 focus:border-bone/35 py-3"
              placeholder="> _"
            />
            <div className="mt-6 flex items-center justify-end">
              <button
                disabled={name.trim().length < 2}
                onClick={() => setStep("email")}
                className="font-mono text-[11px] uppercase tracking-[0.25em] px-6 py-3 border border-bone/20 text-bone hover:border-crimson hover:text-crimson transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                NEXT &gt;
              </button>
            </div>
          </div>
        )}

        {(step === "email" || step === "sending" || step === "error") && (
          <div>
            <p className="font-mono text-[11px] text-bone-dim mb-1">&gt; BRIEF CAPTURED.</p>
            <p className="font-mono text-[11px] text-bone-dim mb-6">&gt; OPERATOR: {name.toUpperCase()}</p>
            {promptLine("Transmission channel. Email:")}
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && /\S+@\S+\.\S+/.test(email) && step === "email" && submit()}
              spellCheck={false}
              disabled={step === "sending"}
              className="w-full bg-transparent font-mono text-base text-bone outline-none border-b border-bone/15 focus:border-bone/35 py-3"
              placeholder="> _"
            />
            {step === "error" && (
              <p className="font-mono text-[11px] text-crimson mt-4">&gt; ERROR: {errorMsg}</p>
            )}
            <div className="mt-8 flex items-center justify-between">
              <span className="font-mono text-[10px] text-bone-dim">
                {step === "sending" ? "TRANSMITTING..." : ""}
                <Caret />
              </span>
              <button
                disabled={!/\S+@\S+\.\S+/.test(email) || step === "sending"}
                onClick={submit}
                className="font-mono text-[11px] uppercase tracking-[0.25em] px-8 py-4 bg-crimson text-bone hover:bg-crimson/85 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                INITIALIZE BUILD SEQUENCE
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="py-8">
            <p className="font-mono text-sm md:text-base text-bone">
              &gt; BUILD SEQUENCE QUEUED. RESPONSE WITHIN 48 HOURS.
              <Caret />
            </p>
            <button
              onClick={onClose}
              className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] px-6 py-3 border border-bone/20 text-bone hover:border-gold hover:text-gold transition-colors"
            >
              RETURN TO GALLERY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
