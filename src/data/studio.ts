/**
 * Studio copy — single source of truth for text that appears in MORE than one
 * place (the gallery overlay panels AND the ACT-2 scroll story). Keeping it here
 * guarantees the panel and the story can never drift apart.
 *
 * Strings below are the user-facing copy. The 5-act noir story (cinematic
 * voice, written for the scroll-driven landing journey) lives here verbatim —
 * the page that renders them may change, the words may not.
 */
import type { ProjectCategory } from "@/data/projects";

// ── ACT 1 — OUT OF THE SHADOWS (hero / opener) ───────────────────────────────
export const HERO_TITLE_LINES = ["YOU THINK IT.", "WE DRIVE IT INTO REALITY."] as const;

export const STORY_EYEBROW = "OUT OF THE SHADOWS";

export const STORY_BRIDGE =
  "Somewhere in the rain, there's an idea refusing to die. It sits in the " +
  "dark, engine cold, waiting for someone willing to turn the key. We take " +
  "what exists only in your head and give it shape, weight, motion. Then we " +
  "drive it all the way into daylight.";

// ── ACT 2 — THE STUDIO (manifest) ────────────────────────────────────────────
export const MANIFEST_EYEBROW = "THE STUDIO";
export const MANIFEST_HEADLINE = "BUILT SMALL. BUILT TO MOVE.";
export const MANIFEST_BODY =
  "ShadeWorks is a software studio founded on the belief that execution beats " +
  "discussion. We build custom software, business control panels, and " +
  "marketing pipelines from nothing but a problem worth solving. No templates. " +
  "No theatre. Just real systems, built at a pace most teams mistake for " +
  "impossible.";

// ── ACT 3 — THE ENGINE ───────────────────────────────────────────────────────
export const ENGINE_EYEBROW = "THE ENGINE";
export const ENGINE_HEADLINE = "MACHINE SPEED CHANGES THE ROAD.";
export const ENGINE_BODY =
  "Behind every build is a coordinated swarm of specialist AI operators: " +
  "architect, build, deploy. They work in parallel while the city sleeps, " +
  "handing work to one another without pause. The result feels less like " +
  "development and more like momentum. What takes agencies six months often " +
  "lands in six weeks. What takes three sprints can arrive in three days.";

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

// ── ACT 4 — THE PROOF ────────────────────────────────────────────────────────
export const PROOF_EYEBROW = "THE PROOF";
export const PROOF_HEADLINE = "THE RECEIPT IS THE SOFTWARE.";
export const PROOF_BODY =
  "Ideas are cheap. Shipping leaves fingerprints. FerdiPoker began as a " +
  "concept and became a real platform built for serious MTT training. This is " +
  "the moment the skyline changes color—the point where speculation ends and " +
  "the product starts speaking for itself.";

// ── ACT 5 — THE OPERATORS (+ CTA) ────────────────────────────────────────────
export const OPERATOR_EYEBROW = "THE OPERATORS";
export const OPERATOR_HEADLINE = "NOT EVERY MISSION MAKES THE LIST.";
export const OPERATOR_BODY =
  "We keep the studio deliberately small so the work stays sharp. Every " +
  "client is vetted. Every build is treated like a mission with a " +
  "destination, not a project with a deadline. If you're carrying something " +
  "worth building, step into the car. We'll show you how far it can go.";

export const OPERATOR_STEPS = [
  { step: "STEP 01", title: "SUBMIT YOUR BRIEF", desc: "Tell us what you want built. Raw, unfiltered, ambitious." },
  { step: "STEP 02", title: "SHADE ENGINE ANALYSIS", desc: "Technical breakdown within 48 hours." },
  { step: "STEP 03", title: "EXECUTION BEGINS", desc: "The swarm deploys. You watch it take shape." },
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
export const CTA_EYEBROW = "// EXECUTE MISSION";
export const CTA_HEADLINE = "YOU THINK IT.";
export const CTA_HEADLINE_2 = "WE DRIVE IT INTO REALITY.";
