"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/BrandIcons";

type ProjectType = "web-app" | "ecommerce" | "dashboard" | "landing" | "other";

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "web-app", label: "Web app" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "dashboard", label: "Dashboard" },
  { value: "landing", label: "Landing page" },
  { value: "other", label: "Other" },
];

export function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [projectType, setProjectType] = useState<ProjectType>("web-app");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      projectType,
      message: String(formData.get("message") || ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Submission failed");
      }

      toast.success("Message sent. We'll be in touch within 48 hours.", {
        description: "Check your inbox for confirmation.",
      });
      form.reset();
      setProjectType("web-app");
    } catch (err) {
      toast.error("Something went wrong.", {
        description: err instanceof Error ? err.message : "Try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative bg-ink-elevated py-32 md:py-48 border-t border-bone/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left — copy */}
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-gold mb-6">
              06 — Contact
            </p>
            <h2
              className="font-display text-bone leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              Start a <span className="text-gold-gradient italic">project</span>.
            </h2>
            <p className="font-serif-italic text-bone-muted text-xl mt-6 leading-relaxed max-w-md">
              Tell us about what you&rsquo;re building. We&rsquo;ll reply within
              48 hours with a few questions and a rough scope.
            </p>

            <div className="mt-12 space-y-6">
              <a
                href="mailto:adrian@shadeworks.dev"
                className="group flex items-center gap-4 text-bone hover:text-gold transition-colors"
              >
                <span className="h-10 w-10 rounded-full border border-bone/15 flex items-center justify-center group-hover:border-gold/60 group-hover:bg-gold/5 transition-all">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="font-mono text-sm">adrian@shadeworks.dev</span>
              </a>

              <div className="flex items-center gap-4 pt-4">
                <a
                  href="https://github.com/stresiadis-blip"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="h-10 w-10 rounded-full border border-bone/15 flex items-center justify-center text-bone-muted hover:text-gold hover:border-gold/60 transition-all"
                >
                  <GitHubIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="h-10 w-10 rounded-full border border-bone/15 flex items-center justify-center text-bone-muted hover:text-gold hover:border-gold/60 transition-all"
                >
                  <LinkedInIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-bone/5 max-w-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
                Office hours
              </p>
              <p className="font-serif-italic text-bone-muted mt-2">
                Mon — Fri · 09:00 — 18:00 GMT+2 <br />
                Async friendly the rest of the time.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="glass-card-gold rounded-lg p-8 md:p-12 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Name" name="name" required>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className="w-full bg-transparent border-b border-bone/20 focus:border-gold focus:outline-none px-0 py-3 text-bone placeholder:text-bone-dim/60 font-sans"
                  />
                </Field>
                <Field label="Email" name="email" required>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full bg-transparent border-b border-bone/20 focus:border-gold focus:outline-none px-0 py-3 text-bone placeholder:text-bone-dim/60 font-sans"
                  />
                </Field>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim block mb-4">
                  Project type
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => setProjectType(t.value)}
                      className={`font-mono text-[11px] uppercase tracking-[0.2em] px-4 py-2 border transition-all ${
                        projectType === t.value
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-bone/15 text-bone-muted hover:border-bone/30 hover:text-bone"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Tell us about it" name="message" required>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="What are you building? Timeline? Budget range? Any specific concerns?"
                  className="w-full bg-transparent border-b border-bone/20 focus:border-gold focus:outline-none px-0 py-3 text-bone placeholder:text-bone-dim/60 font-sans resize-none"
                />
              </Field>

              <div className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-dim">
                  We reply within 48 hours
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex items-center justify-center gap-3 bg-gold text-ink font-mono text-xs uppercase tracking-[0.25em] px-8 py-4 hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Sending..." : "Send message"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  children,
  required,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim block mb-1"
      >
        {label}
        {required ? <span className="text-gold ml-1">*</span> : null}
      </label>
      {children}
    </div>
  );
}
