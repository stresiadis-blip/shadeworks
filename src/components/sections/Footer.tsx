import Link from "next/link";
import { Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/BrandIcons";

const QUICK_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative bg-ink/70 backdrop-blur-md border-t border-bone/10 pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Top — brand + nav */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">
          {/* Brand */}
          <div className="md:col-span-6">
            <Link href="/" className="inline-block group">
              <span className="font-display text-4xl md:text-5xl text-bone leading-none block">
                shade<span className="text-gold">works</span>
              </span>
            </Link>
            <p className="font-serif-italic text-bone-muted text-lg md:text-xl mt-6 max-w-md leading-relaxed">
              Where code casts long. A premium software studio based in
              Constanta, working remote with clients worldwide.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <a
                href="mailto:adrian@shadeworks.dev"
                aria-label="Email"
                className="h-10 w-10 rounded-full border border-bone/15 flex items-center justify-center text-bone-muted hover:text-gold hover:border-gold/60 transition-all"
              >
                <Mail className="h-4 w-4" />
              </a>
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

          {/* Quick links */}
          <div className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              Navigation
            </p>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-sm text-bone-muted hover:text-bone transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio */}
          <div className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              Studio
            </p>
            <ul className="space-y-3 font-mono text-sm text-bone-muted">
              <li>Constanta, Romania</li>
              <li>GMT+2 · Async global</li>
              <li>
                <a
                  href="mailto:adrian@shadeworks.dev"
                  className="hover:text-bone transition-colors"
                >
                  adrian@shadeworks.dev
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="border-t border-bone/10 pt-16 pb-12">
          <p
            aria-hidden="true"
            className="font-display text-bone/[0.08] leading-none tracking-tighter select-none text-center"
            style={{ fontSize: "clamp(4rem, 18vw, 18rem)" }}
          >
            shadeworks
          </p>
        </div>

        {/* Bottom strip */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-bone/10">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim">
            © 2026 Shade Works · Constanta, Romania
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-dim flex items-center gap-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-60 animate-pulse-dot" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
            </span>
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
