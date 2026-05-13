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
      "FerdiPoker is the first dedicated MTT (multi-table tournament) poker training platform in Romanian. Built from zero for the founding team — three professional coaches with 300+ paying members.",
    problem:
      "A growing audience of Romanian poker players had no native-language training option. Existing platforms ran in English with no community layer, no localized pricing, and no integration with the way Romanian players communicate (Discord, WhatsApp, Twitch).",
    solution:
      "A subscription-first product with bilingual copy, Stripe-backed monthly and annual plans, a private video library with progress tracking, and Discord OAuth so paying members are auto-enrolled into the gated server. Admin tooling for the coaches to publish weekly seminars without touching code.",
    results: [
      "300+ paying members in first year",
      "100+ seminars published with weekly cadence",
      "Sub-2-second median Largest Contentful Paint",
      "Zero downtime since launch (Vercel + Supabase)",
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
