/**
 * Studio copy — single source of truth for text that appears in MORE than one
 * place (the gallery overlay panels AND the ACT-2 scroll story). Keeping it here
 * guarantees the panel and the story can never drift apart.
 *
 * Strings below are byte-for-byte the user-facing copy already shipped in
 * OverlayPanels.tsx / the hero overlay. Do not rewrite — only the page that
 * renders them may change.
 */
import type { ProjectCategory } from "@/data/projects";

// ── Hero (mirrors GalleryExperience hero overlay) ────────────────────────────
export const HERO_TITLE_LINES = ["YOU THINK IT.", "WE SHADE IT INTO REALITY."] as const;

// ── THE ENGINE (mirrors EnginePanel) ─────────────────────────────────────────
export const ENGINE_EYEBROW = "THE ENGINE";
export const ENGINE_HEADLINE = "80% FASTER DEPLOYMENT. ZERO TEMPLATES. EVER.";
export const ENGINE_BODY =
  "Shade Works runs a coordinated swarm of specialized AI agents — each one " +
  "trained to architect, code, test, and deploy. They work in parallel. They " +
  "don't sleep. They don't make the same mistake twice. What takes " +
  "agencies 6 months ships in 6 weeks. What takes developers 3 sprints ships " +
  "in 3 days.";

export const ENGINE_AGENTS = [
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
] as const;

// ── OPERATORS (mirrors OperatorsPanel) ───────────────────────────────────────
export const OPERATOR_EYEBROW = "OPERATORS";
export const OPERATOR_HEADLINE = "LOCK IN YOUR CONSULTATION.";
export const OPERATOR_BODY =
  "Shade Works operates in limited capacity. We don't scale headcount — " +
  "we scale output. Every engagement is deliberate, every client is vetted, " +
  "and every build is treated like a mission, not a project.";

export const OPERATOR_STEPS = [
  { step: "STEP 01", title: "SUBMIT YOUR BRIEF", desc: "Tell us what you want built. Raw, unfiltered, ambitious." },
  { step: "STEP 02", title: "SHADE ENGINE ANALYSIS", desc: "Technical breakdown within 48 hours." },
  { step: "STEP 03", title: "EXECUTION BEGINS", desc: "The swarm deploys. You watch it take shape." },
] as const;

// ── ACT-2 connective copy (NEW — bridges between sections, studio tone) ───────
export const STORY_EYEBROW = "SHADE WORKS // STUDIO";

export const STORY_BRIDGE =
  "A studio that builds custom software from nothing — at machine speed, no templates.";

export const MANIFEST_EYEBROW = "// THE STUDIO";
export const MANIFEST_HEADLINE = "BUILT FROM NOTHING.";
export const MANIFEST_BODY =
  "Small studio, machine-speed execution. Real production across three disciplines — not concepts, not slideware.";

/** S2 — the three real capability tracks (order mirrors projects.ts categories). */
export const CATEGORY_BLURBS: { category: ProjectCategory; blurb: string }[] = [
  {
    category: "custom-code",
    blurb: "Custom software and app architecture — built to spec, from the ground up.",
  },
  {
    category: "control-panels",
    blurb: "Business control panels that put every moving part on a single screen.",
  },
  {
    category: "megaphone",
    blurb: "Marketing pipelines that distribute everywhere from one source.",
  },
];

export const PROOF_EYEBROW = "// PROOF";
export const PROOF_HEADLINE = "WE SHIP. HERE'S THE RECEIPT.";

export const CTA_EYEBROW = "// EXECUTE DESCENT";
export const CTA_HEADLINE = "YOU THINK IT.";
export const CTA_HEADLINE_2 = "WE SHADE IT INTO REALITY.";
