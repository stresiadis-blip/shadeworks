/**
 * Studio copy — single source of truth for the landing journey's narration.
 *
 * This is the VOICE-OVER of a noir short film. A tired man drives home through
 * the rain after a long trip, his head full of unfinished ideas. A voice finds
 * him — calm, knowing, a little dangerous — and walks him from the dark toward
 * sunrise on his own street. The voice IS ShadeWorks, but it never pitches; it
 * narrates. Each MOMENT below is one beat of that voice-over, layered over the
 * matching frame of the scroll journey.
 *
 * HEADLINE = the line that lands hardest in the beat (display type).
 * BODY = the rest of the narration, written as it would be heard (mono, typed
 * out line by line like a subtitle). EYEBROW = a quiet scene label.
 *
 * The page that renders these may change; the words may not.
 */
import type { ProjectCategory } from "@/data/projects";

// ── MOMENT 1 — THE EMPTY ROAD (deep noir, rain, car far) ─────────────────────
// Low, intimate, like a voice appearing from nowhere.
export const HERO_TITLE_LINES = ["THE ROAD IS EMPTY.", "YOUR HEAD ISN'T."] as const;

export const STORY_EYEBROW = "// LATE. RAINING.";

export const STORY_BRIDGE =
  "You know that feeling. The road is empty, but your head isn't. Every mile " +
  "carries another idea you never had time to build, another note scribbled " +
  "somewhere, another promise made to yourself and left waiting. You've been " +
  "carrying the whole thing alone for so long, it started to feel normal. The " +
  "rain doesn't ask where you're going. It just keeps falling.";

// ── MOMENT 2 — THE FIRST LIGHTS (city wakes, car mid-road) ───────────────────
// Reflective, slower, a pause between thoughts.
export const MANIFEST_EYEBROW = "// ONE LIGHT, THEN ANOTHER";
export const MANIFEST_HEADLINE = "A SINGLE IDEA, REFUSING TO STAY IN THE DARK.";
export const MANIFEST_BODY =
  "Funny thing about a city. From a distance it looks asleep. Then one light " +
  "comes on. Then another. Then another. That's how most things begin. Not " +
  "with a miracle. Not with a grand plan. Just a single idea refusing to stay " +
  "in the dark. You've got a few of those riding with you tonight.";

// ── MOMENT 3 — THE MACHINE (high-angle, light-arteries, the engine) ──────────
// Growing momentum, confidence without arrogance.
export const ENGINE_EYEBROW = "// LOOK CLOSER";
export const ENGINE_HEADLINE = "THEY JUST STOP DOING EVERYTHING THEMSELVES.";
export const ENGINE_BODY =
  "See those lights moving through the streets? That's work finding its " +
  "place. One thing speaking to another. One piece carrying the weight of the " +
  "next. The people who get ahead aren't stronger than you. They just stop " +
  "doing everything themselves. While they sleep, something keeps working — " +
  "drawing the plans, laying the foundations, building the machine that keeps " +
  "moving long after the lights go out.";

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

// ── MOMENT 4 — THE HORIZON CHANGES (dawn breaks, the proof) ──────────────────
// Revelation, the city opening up around the words.
export const PROOF_EYEBROW = "// THE HORIZON CHANGES";
export const PROOF_HEADLINE = "IMPOSSIBLE IN THE DARK. INEVITABLE IN THE LIGHT.";
export const PROOF_BODY =
  "The horizon always changes before you notice it. Somewhere out there, an " +
  "idea became a real thing — a platform called FerdiPoker. Once it lived in " +
  "someone's head the same way your ideas live in yours now. Then the work " +
  "began. What looked impossible in the dark became inevitable in the light. " +
  "Months folded into weeks. Thoughts became systems. Systems became " +
  "something people could actually touch.";

// ── MOMENT 5 — SUNRISE ON YOUR STREET (arrival home, the offer) ──────────────
// Warm, reassuring, a final pause before silence.
export const OPERATOR_EYEBROW = "// HOME";
export const OPERATOR_HEADLINE = "LET THE SUN TAKE IT FROM HERE.";
export const OPERATOR_BODY =
  "Maybe the burden was never the dream. Maybe it was believing you had to " +
  "carry every piece of it yourself. There are people who build roads where " +
  "others see distance — people who stay awake so the work keeps moving while " +
  "you finally get some rest. So bring the weight with you. The night has done " +
  "its job. Let the sun take it from here.";

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
export const CTA_EYEBROW = "// BRING THE WEIGHT";
export const CTA_HEADLINE = "BRING THE WEIGHT.";
export const CTA_HEADLINE_2 = "LET THE SUN TAKE IT FROM HERE.";
