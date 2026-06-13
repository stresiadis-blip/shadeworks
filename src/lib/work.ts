export type CaseStudy = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  year: string;
  role: string;
  status: "live" | "concept" | "wip";
  stack: string[];
  overview: string;
  problem: string;
  solution: string;
  results?: string[];
  liveUrl?: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "ferdipoker",
    name: "FerdiPoker",
    tagline: "MTT poker training platform — Romanian market",
    description:
      "Subscription-based poker training. Bilingual content, Stripe checkout, member-only video library, and a Discord-linked community layer.",
    year: "2026",
    role: "Full-stack engineering, design, deploy",
    status: "live",
    stack: ["Next.js", "Supabase", "Stripe", "Vercel", "Resend"],
    overview:
      "FerdiPoker is the first dedicated MTT (multi-table tournament) poker training platform in Romanian. Built from zero for the founding team — a group of professional poker coaches — and shipped to live production with recurring paying subscribers.",
    problem:
      "Romanian poker players had no native-language MTT training option. Existing platforms ran in English, with no community layer, no localized pricing, and no integration with how Romanian players actually communicate (Discord).",
    solution:
      "A subscription-first product: fully bilingual (RO/EN), Stripe-backed monthly and annual plans with EU consumer-law consent (OUG 34/2014), a member-only video library with per-user progress tracking, and Discord OAuth so paying members are auto-enrolled into the gated server. The video content is protected with a multi-layer access model (column-level database REVOKE, signed CDN URLs, token auth). Admin tooling lets the coaches publish seminars and go live without touching code.",
    results: [
      "Live in production with recurring Stripe subscribers",
      "130+ seminars published",
      "Lighthouse: Performance 95, Accessibility 100 (mobile)",
      "Largest Contentful Paint 2.4s (Good)",
      "Security headers grade A; full GDPR cookie-consent compliance",
      "Multi-layer video protection (DB-level grants, signed URLs, token auth)",
      "Zero downtime since launch (Vercel + Supabase Pro)",
    ],
    liveUrl: "https://ferdipoker.ro",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return CASE_STUDIES.map((cs) => cs.slug);
}
