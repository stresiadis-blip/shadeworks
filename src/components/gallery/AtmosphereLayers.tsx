"use client";

/**
 * Noir atmosphere — DOM layers stacked in front of the Three.js sphere (z-0)
 * but behind the UI chrome (z-30). Order back-to-front:
 *   halftone (z-10) → rain (z-11) → vignette (z-12) → film grain (z-13)
 * All layers are pointer-events-none so drag/raycast pass straight through.
 *
 * prefers-reduced-motion is honored via CSS (.noir-rain / .noir-grain),
 * so this component renders the same markup either way.
 */
export function AtmosphereLayers() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10" aria-hidden>
      {/* comic halftone print, masked to fade at edges */}
      <div className="noir-halftone absolute inset-0" />
      {/* rain — falls in front of the sphere + moon */}
      <div className="noir-rain absolute inset-0" />
      {/* heavy noir vignette */}
      <div className="noir-vignette absolute inset-0" />
      {/* projected-film grain on top */}
      <div className="noir-grain absolute inset-0" />
    </div>
  );
}
