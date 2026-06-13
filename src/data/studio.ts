/**
 * Studio copy — single source of truth for text that appears in MORE than one
 * place (the gallery overlay panels AND the scroll story). Keeping it here
 * guarantees the panel and the story can never drift apart.
 *
 * The 5-act landing story is written as a late-night radio ad that finds a
 * tired driver on his way home: it names his exhaustion, then sells him a way
 * out — systems, scale, an easier life — until the sun finally rises on his
 * street. Cinematic noir voice, second person, it speaks directly to YOU.
 * The page that renders these may change; the words may not.
 */
import type { ProjectCategory } from "@/data/projects";

// ── ACT 1 — THE DRIVE HOME (hero / opener) ───────────────────────────────────
// Night, rain, the long road back from another exhausting trip. Ideas you
// can't finish sit heavy in the passenger seat. Then the radio finds you.
export const HERO_TITLE_LINES = ["LONG DAY.", "LONGER ROAD HOME."] as const;

export const STORY_EYEBROW = "ON THE ROAD // LATE";

export const STORY_BRIDGE =
  "Another trip done. The rain won't quit, the wipers keep time, and your head " +
  "is full of ideas you never have time to finish. Then the radio cuts " +
  "through the dark — and for once, it's talking to you.";

// ── ACT 2 — THE STUDIO ON THE RADIO ──────────────────────────────────────────
// The ad introduces itself. Calm, sure of itself. We build the systems you
// keep meaning to build but never get to.
export const MANIFEST_EYEBROW = "// THE VOICE ON THE RADIO";
export const MANIFEST_HEADLINE = "YOU RUN IT ALL ALONE. YOU DON'T HAVE TO.";
export const MANIFEST_BODY =
  "This is ShadeWorks. We build the software, the control panels, and the " +
  "systems that carry the weight you've been carrying by hand. Custom-built " +
  "around your business — not templates, not theory. The stuff you keep " +
  "promising yourself you'll set up one day. We set it up.";

// ── ACT 3 — HOW IT WORKS (the engine) ─────────────────────────────────────────
// The ad explains the magic: a team that works together, around the clock,
// so the work that buries you gets done while you sleep.
export const ENGINE_EYEBROW = "// HOW WE WORK";
export const ENGINE_HEADLINE = "A TEAM THAT NEVER SLEEPS, WORKING AS ONE.";
export const ENGINE_BODY =
  "Behind ShadeWorks is a coordinated crew of specialist AI operators — one " +
  "designs it, one builds it, one ships it. They hand the work to each other " +
  "without pause, covering for each other, moving while the city sleeps. What " +
  "buries an agency for six months lands in six weeks. What costs you every " +
  "evening gets done before morning.";

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

// ── ACT 4 — THE PROOF (the sky changes color) ─────────────────────────────────
// You almost don't believe it. So the ad gives you proof — something real,
// already built, already running. The moment doubt starts to lift.
export const PROOF_EYEBROW = "// PROOF, NOT PROMISES";
export const PROOF_HEADLINE = "WE'VE DONE IT BEFORE. HERE'S THE RECEIPT.";
export const PROOF_BODY =
  "Talk is cheap; shipping leaves a mark. FerdiPoker started as one person's " +
  "idea and became a real platform people train on every day. That's the " +
  "moment the sky starts to change color — when an idea you carried alone " +
  "turns into something that runs without you.";

// ── ACT 5 — SUNRISE ON YOUR STREET (operators + CTA) ──────────────────────────
// You pull into your street. The sun comes up. The ad makes its offer: bring
// us what you've been carrying, and we'll show you how far it can go.
export const OPERATOR_EYEBROW = "// PULLING INTO YOUR STREET";
export const OPERATOR_HEADLINE = "BRING THE IDEA. WE'LL MAKE THE SUN RISE.";
export const OPERATOR_BODY =
  "We keep the studio small on purpose, so every build gets our full weight. " +
  "Every client is chosen, every project treated like it matters — because to " +
  "you, it does. You've carried it far enough alone. Pull in, hand it over, " +
  "and watch the morning break over your street.";

export const OPERATOR_STEPS = [
  { step: "STEP 01", title: "TELL US THE IDEA", desc: "The one you keep meaning to build. Raw, unfiltered, ambitious." },
  { step: "STEP 02", title: "WE MAP THE SYSTEM", desc: "A technical breakdown of how it gets built — within 48 hours." },
  { step: "STEP 03", title: "THE WORK BEGINS", desc: "The crew deploys. You finally watch it take shape." },
] as const;

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

// ── CTA ───────────────────────────────────────────────────────────────────────
export const CTA_EYEBROW = "// PULL IN";
export const CTA_HEADLINE = "BRING THE IDEA.";
export const CTA_HEADLINE_2 = "WE'LL MAKE THE SUN RISE.";
