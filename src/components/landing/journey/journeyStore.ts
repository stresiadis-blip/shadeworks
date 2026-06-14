import { proxy } from "valtio";

/**
 * Shared scroll-driven state for the landing journey. The ScrollTrigger writes
 * it once per scroll update; the canvas reads it imperatively in its rAF loop
 * (no React render), and only the process accordion subscribes to `activeStep`
 * via useSnapshot — so a frame never re-renders React.
 */
export interface JourneyState {
  /** 0..1 across the pinned scroll region. */
  progress: number;
  /** clamp((progress - 0.59) / 0.41, 0, 1) — colour bleeds in from 59%. */
  colorProgress: number;
  /** 0..5 — which of the six process steps is open. */
  activeStep: number;
}

export const TOTAL_STEPS = 6;
/** Process steps occupy the scroll after the hero has faded. */
const STEP_START = 0.16;

export const journeyStore = proxy<JourneyState>({
  progress: 0,
  colorProgress: 0,
  activeStep: 0,
});

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Map a raw 0..1 scroll progress onto the three derived store fields. */
export function setJourneyProgress(progress: number): void {
  const p = clamp01(progress);
  journeyStore.progress = p;
  journeyStore.colorProgress = clamp01((p - 0.59) / 0.41);
  const stepProg = clamp01((p - STEP_START) / (1 - STEP_START));
  journeyStore.activeStep = Math.min(
    TOTAL_STEPS - 1,
    Math.floor(stepProg * TOTAL_STEPS),
  );
}
